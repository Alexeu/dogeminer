import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAUCETPAY_API_URL = 'https://faucetpay.io/api/v1';
const FAUCETPAY_API_KEY = Deno.env.get('FAUCETPAY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Rate limiting constants
const DAILY_WITHDRAWAL_LIMIT = 5; // Max 5 DOGE per day
const MIN_WITHDRAWAL_AMOUNT = 2; // Min 2 DOGE per withdrawal
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const IP_RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per IP
const IP_WITHDRAWAL_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const IP_WITHDRAWAL_LIMIT_MAX = 5; // Max 5 withdrawal attempts per hour per IP

// Helper to get client IP
const getClientIP = (req: Request): string => {
  // Check various headers for the real IP (in order of preference)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one (client IP)
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback - should not reach in production
  return 'unknown';
};

// IP-based rate limiting check
const checkIPRateLimit = async (
  supabase: any,
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> => {
  const windowStart = new Date(Date.now() - windowMs);
  
  // Try to get existing rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Rate limit fetch error:', fetchError.message);
    // On error, allow the request but log it
    return { allowed: true, remaining: maxRequests, resetAt: new Date(Date.now() + windowMs) };
  }

  // If no existing record or window has expired, create/reset
  if (!existing || new Date(existing.window_start) < windowStart) {
    const newWindowStart = new Date();
    
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        ip_address: ip,
        endpoint: endpoint,
        request_count: 1,
        window_start: newWindowStart.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'ip_address,endpoint'
      });

    if (upsertError) {
      console.error('Rate limit upsert error:', upsertError.message);
    }

    return { 
      allowed: true, 
      remaining: maxRequests - 1, 
      resetAt: new Date(newWindowStart.getTime() + windowMs) 
    };
  }

  // Check if limit exceeded
  if (existing.request_count >= maxRequests) {
    const resetAt = new Date(new Date(existing.window_start).getTime() + windowMs);
    return { allowed: false, remaining: 0, resetAt };
  }

  // Increment counter
  const { error: updateError } = await supabase
    .from('rate_limits')
    .update({ 
      request_count: existing.request_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', existing.id);

  if (updateError) {
    console.error('Rate limit update error:', updateError.message);
  }

  return { 
    allowed: true, 
    remaining: maxRequests - existing.request_count - 1, 
    resetAt: new Date(new Date(existing.window_start).getTime() + windowMs) 
  };
};

// Input validation
const SUPPORTED_CURRENCIES = ['DOGE'] as const;
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

const validateCurrency = (currency: string): currency is SupportedCurrency => {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && amount <= 10000000 && Number.isFinite(amount);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client with service role for admin operations
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Get client IP for rate limiting
  const clientIP = getClientIP(req);
  console.log(`Request from IP: ${clientIP}`);

  try {
    // General IP rate limit check (applies to all requests)
    const generalRateLimit = await checkIPRateLimit(
      supabaseAdmin,
      clientIP,
      'faucetpay_general',
      IP_RATE_LIMIT_MAX_REQUESTS,
      IP_RATE_LIMIT_WINDOW_MS
    );

    if (!generalRateLimit.allowed) {
      console.warn(`IP rate limit exceeded for ${clientIP}`);
      return new Response(JSON.stringify({ 
        status: 429, 
        message: `Too many requests. Please try again in ${Math.ceil((generalRateLimit.resetAt.getTime() - Date.now()) / 1000)} seconds.`
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': generalRateLimit.resetAt.toISOString()
        },
      });
    }

    // Extract and verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(JSON.stringify({ 
        status: 401, 
        message: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user's JWT and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('JWT verification failed:', authError?.message);
      return new Response(JSON.stringify({ 
        status: 401, 
        message: 'Invalid or expired token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);

    const { action, address, amount, currency = 'DOGE' } = await req.json();
    console.log(`FaucetPay action: ${action}, currency: ${currency}`);

    // Validate currency against whitelist
    if (!validateCurrency(currency)) {
      return new Response(JSON.stringify({ 
        status: 400, 
        message: `Unsupported currency. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!FAUCETPAY_API_KEY) {
      console.error('FaucetPay API key not configured');
      return new Response(JSON.stringify({ 
        status: 500, 
        message: 'FaucetPay API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let endpoint = '';
    let body: Record<string, string> = {
      api_key: FAUCETPAY_API_KEY,
    };

    switch (action) {
      case 'getBalance':
        endpoint = '/balance';
        body.currency = currency;
        break;
      
      case 'checkAddress':
        // Validate email/address format
        if (!address || typeof address !== 'string') {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Address is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!validateEmail(address)) {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Invalid email format' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        endpoint = '/checkaddress';
        body.address = address;
        body.currency = currency;
        break;
      
      case 'send':
        // ADDITIONAL IP RATE LIMIT FOR WITHDRAWALS
        const withdrawalRateLimit = await checkIPRateLimit(
          supabaseAdmin,
          clientIP,
          'faucetpay_withdrawal',
          IP_WITHDRAWAL_LIMIT_MAX,
          IP_WITHDRAWAL_LIMIT_WINDOW_MS
        );

        if (!withdrawalRateLimit.allowed) {
          console.warn(`Withdrawal rate limit exceeded for IP ${clientIP}`);
          return new Response(JSON.stringify({ 
            status: 429, 
            message: `Too many withdrawal attempts. Please try again in ${Math.ceil((withdrawalRateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`
          }), {
            status: 429,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': withdrawalRateLimit.resetAt.toISOString()
            },
          });
        }

        // CRITICAL: Validate inputs
        if (!address || typeof address !== 'string') {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Address is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!validateEmail(address)) {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Invalid email format' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!validateAmount(amount)) {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Invalid amount. Must be a positive number.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Minimum withdrawal amount
        if (amount < MIN_WITHDRAWAL_AMOUNT) {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: `Minimum withdrawal is ${MIN_WITHDRAWAL_AMOUNT} DOGE` 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // CRITICAL: Check user's database balance before withdrawal
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('mining_balance, deposit_balance, total_withdrawn')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          console.error('Failed to fetch user profile:', profileError?.message);
          return new Response(JSON.stringify({ 
            status: 500, 
            message: 'Failed to verify user balance' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Combine mining_balance and deposit_balance for total available
        const miningBalance = Number(profile.mining_balance) || 0;
        const depositBalance = Number(profile.deposit_balance) || 0;
        const userBalance = miningBalance + depositBalance;
        console.log(`User ${userId} balance: ${userBalance}, requested: ${amount}`);

        if (userBalance < amount) {
          return new Response(JSON.stringify({ 
            status: 400, 
            message: 'Insufficient balance' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // RATE LIMITING: Check daily withdrawal limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const { data: dailyWithdrawals, error: withdrawalError } = await supabaseAdmin
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('type', 'withdrawal')
          .in('status', ['pending', 'completed'])
          .gte('created_at', todayISO);

        if (withdrawalError) {
          console.error('Failed to check daily withdrawals:', withdrawalError.message);
          return new Response(JSON.stringify({ 
            status: 500, 
            message: 'Failed to verify withdrawal limits' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const todayTotal = dailyWithdrawals?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
        const remainingLimit = DAILY_WITHDRAWAL_LIMIT - todayTotal;
        
        console.log(`User ${userId} daily withdrawals: ${todayTotal}, remaining: ${remainingLimit}, requested: ${amount}`);

        if (todayTotal + amount > DAILY_WITHDRAWAL_LIMIT) {
          return new Response(JSON.stringify({ 
            status: 429, 
            message: `Daily withdrawal limit exceeded. You can withdraw up to ${remainingLimit} DOGE today. Limit resets at midnight UTC.` 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create pending transaction record BEFORE sending
        const { data: transaction, error: txError } = await supabaseAdmin
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'withdrawal',
            amount: amount,
            faucetpay_address: address,
            status: 'pending',
            notes: `FaucetPay withdrawal to ${address}`
          })
          .select()
          .single();

        if (txError || !transaction) {
          console.error('Failed to create transaction record:', txError?.message);
          return new Response(JSON.stringify({ 
            status: 500, 
            message: 'Failed to process withdrawal' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Created pending transaction: ${transaction.id}`);

        // Deduct balance from user's profile - deduct from mining_balance first, then deposit_balance
        let newMiningBalance = miningBalance;
        let newDepositBalance = depositBalance;
        
        if (miningBalance >= amount) {
          newMiningBalance = miningBalance - amount;
        } else {
          // Deduct from mining first, then remainder from deposit
          const remainingToDeduct = amount - miningBalance;
          newMiningBalance = 0;
          newDepositBalance = depositBalance - remainingToDeduct;
        }
        
        const { error: deductError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            mining_balance: newMiningBalance,
            deposit_balance: newDepositBalance,
            total_withdrawn: Number(profile.total_withdrawn || 0) + amount
          })
          .eq('id', userId);

        if (deductError) {
          console.error('Failed to deduct balance:', deductError.message);
          // Mark transaction as failed
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed', notes: 'Failed to deduct balance' })
            .eq('id', transaction.id);
          
          return new Response(JSON.stringify({ 
            status: 500, 
            message: 'Failed to process withdrawal' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Now send via FaucetPay
        endpoint = '/send';
        body.to = address;
        // FaucetPay expects amount in satoshi (1 DOGE = 100,000,000 satoshi)
        const amountInSatoshi = Math.floor(amount * 100000000);
        body.amount = String(amountInSatoshi);
        body.currency = currency;

        // Make FaucetPay API call
        const formData = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          formData.append(key, value);
        });

        console.log(`Calling FaucetPay API: ${FAUCETPAY_API_URL}${endpoint}`);

        const fpResponse = await fetch(`${FAUCETPAY_API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const fpData = await fpResponse.json();
        console.log('FaucetPay send response status:', fpData.status);

        if (fpData.status === 200) {
          // Update transaction as completed
          await supabaseAdmin
            .from('transactions')
            .update({ 
              status: 'completed', 
              tx_hash: fpData.payout_id || null,
              notes: `Successfully sent ${amount} BONK to ${address}`
            })
            .eq('id', transaction.id);

          return new Response(JSON.stringify(fpData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // FaucetPay failed - refund the user
          console.error('FaucetPay send failed:', fpData.message);
          
          // Restore original balances on failure
          await supabaseAdmin
            .from('profiles')
            .update({ 
              mining_balance: miningBalance,
              deposit_balance: depositBalance,
              total_withdrawn: Number(profile.total_withdrawn || 0)
            })
            .eq('id', userId);

          await supabaseAdmin
            .from('transactions')
            .update({ 
              status: 'failed', 
              notes: `FaucetPay error: ${fpData.message}` 
            })
            .eq('id', transaction.id);

          return new Response(JSON.stringify({ 
            status: fpData.status || 400, 
            message: fpData.message || 'FaucetPay withdrawal failed' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      
      case 'getFaucetList':
        endpoint = '/faucetlist';
        body.currency = currency;
        break;

      default:
        return new Response(JSON.stringify({ 
          status: 400, 
          message: `Unknown action: ${action}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // For non-send actions, make the API call
    if (action !== 'send') {
      const formData = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log(`Calling FaucetPay API: ${FAUCETPAY_API_URL}${endpoint}`);

      const response = await fetch(`${FAUCETPAY_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log('FaucetPay response status:', data.status);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // This shouldn't be reached, but just in case
    return new Response(JSON.stringify({ status: 400, message: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('FaucetPay error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error processing request';
    return new Response(JSON.stringify({ 
      status: 500, 
      message: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Copy,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Plus,
  Dog,
  Cpu,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Gift,
  Sparkles,
  Trophy,
  Coins,
  Minus
} from "lucide-react";
import { formatDoge } from "@/data/dogeData";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface PendingDeposit {
  id: string;
  user_id: string;
  amount: number;
  tx_hash: string | null;
  created_at: string;
  status: string;
  notes: string | null;
  user_email?: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  mining_balance: number | null;
  deposit_balance: number | null;
  total_earned: number | null;
  total_deposited: number | null;
  total_withdrawn: number | null;
  created_at: string | null;
  is_banned: boolean | null;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  tx_hash: string | null;
  faucetpay_address: string | null;
  notes: string | null;
  user_email?: string;
}

interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  faucetpay_email: string;
  verification_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  verified_at: string | null;
  user_email?: string;
}

interface WebMiningSession {
  id: string;
  user_id: string;
  total_hashes: number;
  hashes_pending: number;
  total_rewards: number;
  last_hash_at: string | null;
  is_active: boolean;
  updated_at: string;
  user_email?: string;
}

interface ReferralStat {
  user_id: string;
  email: string | null;
  username: string | null;
  referral_code: string | null;
  total_referrals: number;
  contest_referrals: number;
}

interface UserRdogeToken {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  
  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [addingBalance, setAddingBalance] = useState(false);
  const [balanceType, setBalanceType] = useState<'mining_balance' | 'deposit_balance'>('deposit_balance');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  
  // Deposits state
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [allDeposits, setAllDeposits] = useState<Transaction[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [depositSearchQuery, setDepositSearchQuery] = useState("");
  const [depositRequestSearchQuery, setDepositRequestSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [depositSortOrder, setDepositSortOrder] = useState<'asc' | 'desc'>('desc');
  const [depositRequestSortOrder, setDepositRequestSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [withdrawalSortOrder, setWithdrawalSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Web Mining state
  const [webMiningSessions, setWebMiningSessions] = useState<WebMiningSession[]>([]);

  // Referral stats state
  const [referralStats, setReferralStats] = useState<ReferralStat[]>([]);
  const [referralSearchQuery, setReferralSearchQuery] = useState("");

  // RDOGE Tokens state
  const [rdogeTokens, setRdogeTokens] = useState<UserRdogeToken[]>([]);
  const [rdogeSearchQuery, setRdogeSearchQuery] = useState("");
  const [selectedUserForTokens, setSelectedUserForTokens] = useState<UserProfile | null>(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenOperation, setTokenOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [modifyingTokens, setModifyingTokens] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  // Realtime subscriptions for deposits, web mining, profiles and transactions
  useEffect(() => {
    if (!isAdmin) return;

    const depositsChannel = supabase
      .channel('admin-deposits-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => {
          fetchDepositRequests();
        }
      )
      .subscribe();

    const webMiningChannel = supabase
      .channel('admin-webmining-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'web_mining_sessions' },
        () => {
          fetchWebMiningSessions();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('admin-transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          fetchPendingDeposits();
          fetchAllDeposits();
          fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(webMiningChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [isAdmin]);

  const checkAdminRole = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: t('common.error'),
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchAllData();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchPendingDeposits(),
      fetchAllDeposits(),
      fetchDepositRequests(),
      fetchWithdrawals(),
      fetchWebMiningSessions(),
      fetchReferralStats(),
      fetchRdogeTokens()
    ]);
  };

  const fetchReferralStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_referral_stats');
      if (error) throw error;
      setReferralStats(data || []);
    } catch (error) {
      console.error('Fetch referral stats error:', error);
    }
  };

  const fetchRdogeTokens = async () => {
    try {
      const { data: tokens, error } = await supabase
        .from('user_rdoge_tokens')
        .select('*')
        .order('balance', { ascending: false });

      if (error) throw error;

      const tokensWithEmails = await Promise.all(
        (tokens || []).map(async (token) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', token.user_id)
            .maybeSingle();
          
          return {
            ...token,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setRdogeTokens(tokensWithEmails);
    } catch (error) {
      console.error('Fetch RDOGE tokens error:', error);
    }
  };

  const handleModifyRdogeTokens = async () => {
    if (!selectedUserForTokens) return;
    
    const amount = parseFloat(tokenAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: t('common.error'),
        description: "Ingresa una cantidad válida",
        variant: "destructive",
      });
      return;
    }

    setModifyingTokens(true);
    try {
      const { data, error } = await supabase.rpc('admin_modify_rdoge_tokens', {
        p_user_id: selectedUserForTokens.id,
        p_amount: amount,
        p_operation: tokenOperation
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number; previous_balance?: number };
      if (!result.success) {
        throw new Error(result.error || 'Failed to modify tokens');
      }

      const opLabels = {
        'add': 'agregados a',
        'subtract': 'restados de',
        'set': 'establecidos para'
      };

      toast({
        title: t('common.success'),
        description: `${amount.toLocaleString()} RDOGE ${opLabels[tokenOperation]} ${selectedUserForTokens.email}. Nuevo balance: ${result.new_balance?.toLocaleString()} RDOGE`,
      });

      setTokenAmount("");
      setSelectedUserForTokens(null);
      setTokenOperation('add');
      await fetchRdogeTokens();
    } catch (error: any) {
      console.error('Modify RDOGE tokens error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setModifyingTokens(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users in batches to handle more than 1000 users
      let allUsers: UserProfile[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, mining_balance, deposit_balance, total_earned, total_deposited, total_withdrawn, created_at, is_banned')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allUsers = [...allUsers, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      setUsers(allUsers);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchPendingDeposits = async () => {
    try {
      const { data: deposits, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const depositsWithEmails = await Promise.all(
        (deposits || []).map(async (deposit) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', deposit.user_id)
            .single();
          
          return {
            ...deposit,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setPendingDeposits(depositsWithEmails);
    } catch (error) {
      console.error('Fetch pending deposits error:', error);
    }
  };

  const fetchAllDeposits = async () => {
    try {
      // Fetch ALL deposits without limit using batched fetch
      let allDepositsData: Transaction[] = [];
      let from = 0;
      const batchSize = 500;
      let hasMore = true;

      while (hasMore) {
        const { data: deposits, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'deposit')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        
        if (deposits && deposits.length > 0) {
          allDepositsData = [...allDepositsData, ...deposits];
          from += batchSize;
          hasMore = deposits.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const depositsWithEmails = await Promise.all(
        allDepositsData.map(async (deposit) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', deposit.user_id)
            .maybeSingle();
          
          return {
            ...deposit,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setAllDeposits(depositsWithEmails);
    } catch (error) {
      console.error('Fetch all deposits error:', error);
    }
  };

  const fetchDepositRequests = async () => {
    try {
      // Fetch ALL deposit requests without limit, sorted by status and date
      let allRequests: DepositRequest[] = [];
      let from = 0;
      const batchSize = 500;
      let hasMore = true;

      while (hasMore) {
        const { data: requests, error } = await supabase
          .from('deposits')
          .select('*')
          .order('status', { ascending: true }) // pending first
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        
        if (requests && requests.length > 0) {
          allRequests = [...allRequests, ...requests];
          from += batchSize;
          hasMore = requests.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const requestsWithEmails = await Promise.all(
        allRequests.map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', req.user_id)
            .maybeSingle();
          
          return {
            ...req,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setDepositRequests(requestsWithEmails);
    } catch (error) {
      console.error('Fetch deposit requests error:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      // Fetch ALL withdrawals without limit using batched fetch
      let allWithdrawalsData: Transaction[] = [];
      let from = 0;
      const batchSize = 500;
      let hasMore = true;

      while (hasMore) {
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        
        if (txs && txs.length > 0) {
          allWithdrawalsData = [...allWithdrawalsData, ...txs];
          from += batchSize;
          hasMore = txs.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const txsWithEmails = await Promise.all(
        allWithdrawalsData.map(async (tx) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', tx.user_id)
            .maybeSingle();
          
          return {
            ...tx,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setWithdrawals(txsWithEmails);
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
    }
  };

  const fetchWebMiningSessions = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('web_mining_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_hash_at', { ascending: false });

      if (error) throw error;

      const sessionsWithEmails = await Promise.all(
        (sessions || []).map(async (session) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', session.user_id)
            .single();
          
          return {
            ...session,
            user_email: profile?.email || 'Unknown'
          };
        })
      );

      setWebMiningSessions(sessionsWithEmails);
    } catch (error) {
      console.error('Fetch web mining sessions error:', error);
    }
  };

  const handleModifyBalance = async () => {
    if (!selectedUser) return;
    
    const amount = parseFloat(addBalanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('common.error'),
        description: "Ingresa una cantidad válida",
        variant: "destructive",
      });
      return;
    }

    setAddingBalance(true);
    try {
      const { data, error } = await supabase.rpc('admin_modify_balance', {
        p_user_id: selectedUser.id,
        p_balance_type: balanceType,
        p_operation: balanceOperation,
        p_amount: amount
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number; previous_balance?: number };
      if (!result.success) {
        throw new Error(result.error || 'Failed to modify balance');
      }

      const balanceLabel = balanceType === 'mining_balance' ? 'Minado' : 'Depósito';
      const opLabel = balanceOperation === 'add' ? 'agregados a' : 'restados de';

      toast({
        title: t('common.success'),
        description: `${formatDoge(amount)} DOGE ${opLabel} ${balanceLabel} de ${selectedUser.email}`,
      });

      setAddBalanceAmount("");
      setSelectedUser(null);
      setBalanceOperation('add');
      setBalanceType('deposit_balance');
      await fetchUsers();
    } catch (error: any) {
      console.error('Modify balance error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingBalance(false);
    }
  };

  const handleApprove = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      const { data: addResult, error: addError } = await supabase.rpc('admin_add_balance', {
        p_user_id: deposit.user_id,
        p_amount: deposit.amount
      });

      if (addError) throw addError;

      const result = addResult as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add balance');
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          notes: `Aprobado por admin. ${deposit.notes || ''}`
        })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      await supabase.functions.invoke('notify-admin-deposit', {
        body: {
          action: 'notify_user',
          user_id: deposit.user_id,
          amount: deposit.amount,
          status: 'approved'
        }
      });

      toast({
        title: t('common.success'),
        description: `${formatDoge(deposit.amount)} DOGE acreditados a ${deposit.user_email}`,
      });

      fetchPendingDeposits();
      fetchAllDeposits();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          notes: `Rechazado por admin. ${deposit.notes || ''}`
        })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      toast({
        title: t('common.success'),
        description: `El depósito de ${deposit.user_email} fue rechazado`,
      });

      fetchPendingDeposits();
      fetchAllDeposits();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDepositRequest = async (request: DepositRequest) => {
    setProcessingId(request.id);
    try {
      // Add balance to user
      const { data: addResult, error: addError } = await supabase.rpc('admin_add_balance', {
        p_user_id: request.user_id,
        p_amount: request.amount
      });

      if (addError) throw addError;

      const result = addResult as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add balance');
      }

      // Update deposit status
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ 
          status: 'completed',
          verified_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: t('common.success'),
        description: `${formatDoge(request.amount)} DOGE acreditados a ${request.user_email}`,
      });

      fetchDepositRequests();
      fetchUsers();
    } catch (error: any) {
      console.error('Approve deposit request error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDepositRequest = async (request: DepositRequest) => {
    setProcessingId(request.id);
    try {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: t('common.success'),
        description: `Solicitud de depósito de ${request.user_email} rechazada`,
      });

      fetchDepositRequests();
    } catch (error: any) {
      console.error('Reject deposit request error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Copiado al portapapeles" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-emerald-500/20 text-emerald-500',
      pending: 'bg-amber-500/20 text-amber-500',
      failed: 'bg-destructive/20 text-destructive'
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('admin.back')}
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button onClick={fetchAllData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('admin.refresh')}
            </Button>
          </div>
        </div>

        {/* Promo Banner */}
        {new Date() < new Date('2026-01-07T00:00:00Z') && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-emerald-600">PROMO FIN DE AÑO ACTIVA</span>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  +25% bonus en depósitos &gt; 3 DOGE • Termina: 6 de Enero 2026 ({Math.ceil((new Date('2026-01-07T00:00:00Z').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes)
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 max-w-4xl">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              {t('admin.users')}
            </TabsTrigger>
            <TabsTrigger value="pending-deposits" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendientes
              {depositRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                  {depositRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deposits" className="gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              {t('admin.deposits')}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <ArrowUpFromLine className="w-4 h-4" />
              {t('admin.withdrawals')}
            </TabsTrigger>
            <TabsTrigger value="webmining" className="gap-2">
              <Cpu className="w-4 h-4" />
              Web Mining
              {webMiningSessions.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500 text-white">
                  {webMiningSessions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Trophy className="w-4 h-4" />
              Referidos
            </TabsTrigger>
            <TabsTrigger value="rdoge-tokens" className="gap-2">
              <Coins className="w-4 h-4" />
              RDOGE
              {rdogeTokens.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500 text-black">
                  {rdogeTokens.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              {/* User Counter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Usuarios</p>
                    <p className="text-2xl font-bold text-foreground">{users.length.toLocaleString()}</p>
                  </div>
                </div>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.searchUser')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Search Results Count */}
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando {filteredUsers.length.toLocaleString()} de {users.length.toLocaleString()} usuarios
                </p>
              )}

              {/* Modify Balance Modal */}
              {selectedUser && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Modificar saldo de: {selectedUser.email}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {/* Balance Type */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={balanceType === 'mining_balance' ? 'default' : 'outline'}
                        onClick={() => setBalanceType('mining_balance')}
                        className={balanceType === 'mining_balance' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                      >
                        <Cpu className="w-3 h-3 mr-1" />
                        Minado
                      </Button>
                      <Button
                        size="sm"
                        variant={balanceType === 'deposit_balance' ? 'default' : 'outline'}
                        onClick={() => setBalanceType('deposit_balance')}
                        className={balanceType === 'deposit_balance' ? 'bg-primary hover:bg-primary/90' : ''}
                      >
                        <ArrowDownToLine className="w-3 h-3 mr-1" />
                        Depósito
                      </Button>
                    </div>
                    {/* Operation Type */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={balanceOperation === 'add' ? 'default' : 'outline'}
                        onClick={() => setBalanceOperation('add')}
                        className={balanceOperation === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Añadir
                      </Button>
                      <Button
                        size="sm"
                        variant={balanceOperation === 'subtract' ? 'default' : 'outline'}
                        onClick={() => setBalanceOperation('subtract')}
                        className={balanceOperation === 'subtract' ? 'bg-destructive hover:bg-destructive/90' : ''}
                      >
                        <ArrowDown className="w-3 h-3 mr-1" />
                        Restar
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Cantidad DOGE"
                      value={addBalanceAmount}
                      onChange={(e) => setAddBalanceAmount(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      onClick={handleModifyBalance} 
                      disabled={addingBalance}
                      className={balanceOperation === 'subtract' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      {addingBalance ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : balanceOperation === 'add' ? (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Añadir
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4 mr-1" />
                          Restar
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setSelectedUser(null);
                      setBalanceOperation('add');
                      setBalanceType('deposit_balance');
                      setAddBalanceAmount('');
                    }}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Saldo actual: Minado <span className="text-blue-400 font-mono">{formatDoge(selectedUser.mining_balance || 0)}</span> | 
                    Depósito <span className="text-primary font-mono">{formatDoge(selectedUser.deposit_balance || 0)}</span>
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Minado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Depósito</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">RDOGE</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Ganado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Depositado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Retirado</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-3 px-4">
                          <span className="text-sm">{u.email}</span>
                          {u.is_banned && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                              Banned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-blue-400 font-medium">
                            {formatDoge(u.mining_balance || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-primary font-medium">
                            {formatDoge(u.deposit_balance || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-yellow-500 font-medium">
                            {(rdogeTokens.find(t => t.user_id === u.id)?.balance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-emerald-500">
                            {formatDoge(u.total_earned || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-cyan-400">
                            {formatDoge(u.total_deposited || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-amber-500">
                            {formatDoge(u.total_withdrawn || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(u)}
                          >
                            <ArrowUpDown className="w-3 h-3 mr-1" />
                            Modificar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('admin.noUsers')}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pending Deposits Tab */}
          <TabsContent value="pending-deposits" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Depósitos Pendientes de Acreditar</h2>
                  <p className="text-sm text-muted-foreground">Solicitudes de usuarios esperando verificación manual</p>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-lg font-bold">
                  {depositRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>

              {depositRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">¡No hay depósitos pendientes! 🎉</p>
                  <p className="text-sm">Todos los depósitos han sido procesados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {depositRequests
                    .filter(r => r.status === 'pending')
                    .map((request) => (
                    <div 
                      key={request.id}
                      className="p-5 rounded-xl bg-secondary/30 border border-amber-500/30"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Dog className="w-6 h-6 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                              {formatDoge(request.amount)} DOGE
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                              Pendiente
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Usuario: </span>
                              <span className="font-medium text-foreground">{request.user_email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">FaucetPay: </span>
                              <span className="font-medium text-foreground">{request.faucetpay_email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Código: </span>
                              <code className="bg-background/50 px-2 py-0.5 rounded font-mono text-cyan-400">
                                {request.verification_code}
                              </code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Creado: </span>
                              <span className="font-medium">{formatDate(request.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 lg:flex-col">
                          <Button
                            onClick={() => handleApproveDepositRequest(request)}
                            disabled={processingId === request.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Acreditar
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRejectDepositRequest(request)}
                            disabled={processingId === request.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="space-y-6">
            {/* Pending Deposits */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold">{t('admin.pendingDeposits')}</h2>
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm">
                  {pendingDeposits.length}
                </span>
              </div>

              {pendingDeposits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('admin.noPending')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDeposits.map((deposit) => (
                    <div 
                      key={deposit.id}
                      className="p-4 rounded-xl bg-secondary/30 border border-border/50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Dog className="w-5 h-5 text-primary" />
                            <span className="text-lg font-bold text-primary">
                              {formatDoge(deposit.amount)} DOGE
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                              {t('faucetpay.pending')}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>{t('admin.user')}: <span className="font-medium text-foreground">{deposit.user_email}</span></p>
                            <p>{t('admin.date')}: {formatDate(deposit.created_at)}</p>
                          </div>

                          {deposit.tx_hash && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">TX:</span>
                              <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono">
                                {deposit.tx_hash.slice(0, 20)}...{deposit.tx_hash.slice(-10)}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(deposit.tx_hash!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <a
                                href={`https://dogechain.info/tx/${deposit.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(deposit)}
                            disabled={processingId === deposit.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {processingId === deposit.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t('admin.approve')}
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(deposit)}
                            disabled={processingId === deposit.id}
                            variant="destructive"
                          >
                            {processingId === deposit.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('admin.reject')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Deposits */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{t('admin.allDeposits')}</h2>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email de usuario o FaucetPay..."
                    value={depositSearchQuery}
                    onChange={(e) => setDepositSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {depositSearchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando {allDeposits.filter(tx => 
                    tx.user_email?.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
                    tx.faucetpay_address?.toLowerCase().includes(depositSearchQuery.toLowerCase())
                  ).length} resultados
                </p>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.user')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">FaucetPay Email</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.amount')}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.status')}</th>
                      <th 
                        className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setDepositSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {t('admin.date')}
                          {depositSortOrder === 'desc' ? (
                            <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDeposits
                      .filter(tx => 
                        !depositSearchQuery ||
                        tx.user_email?.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
                        tx.faucetpay_address?.toLowerCase().includes(depositSearchQuery.toLowerCase())
                      )
                      .sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime();
                        const dateB = new Date(b.created_at).getTime();
                        return depositSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                      })
                      .map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">
                          <div>{tx.user_email}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {tx.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{tx.faucetpay_address || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          {tx.notes?.includes('RDOGE') || tx.notes?.includes('RPGDOGE') || tx.notes?.includes('token') ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center gap-1 justify-center">
                              <Coins className="w-3 h-3" />
                              RDOGE
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary flex items-center gap-1 justify-center">
                              <Dog className="w-3 h-3" />
                              DOGE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-primary">{formatDoge(tx.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allDeposits.filter(tx => 
                  !depositSearchQuery ||
                  tx.user_email?.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
                  tx.faucetpay_address?.toLowerCase().includes(depositSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron depósitos
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Requests (from deposits table) */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-xl font-bold">Solicitudes de Depósito</h2>
                  <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-500 text-sm">
                    {depositRequests.length}
                  </span>
                </div>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email o código de verificación..."
                    value={depositRequestSearchQuery}
                    onChange={(e) => setDepositRequestSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">FaucetPay Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Código</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th 
                        className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setDepositRequestSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Creado
                          {depositRequestSortOrder === 'desc' ? (
                            <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Expira</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositRequests
                      .filter(req => 
                        !depositRequestSearchQuery ||
                        req.user_email?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase()) ||
                        req.faucetpay_email?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase()) ||
                        req.verification_code?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase())
                      )
                      .sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime();
                        const dateB = new Date(b.created_at).getTime();
                        return depositRequestSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                      })
                      .map((req) => (
                      <tr key={req.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">
                          <div>{req.user_email}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {req.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{req.faucetpay_email}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono text-cyan-400">
                            {req.verification_code}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-primary">{formatDoge(req.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {formatDate(req.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {formatDate(req.expires_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {depositRequests.filter(req => 
                  !depositRequestSearchQuery ||
                  req.user_email?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase()) ||
                  req.faucetpay_email?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase()) ||
                  req.verification_code?.toLowerCase().includes(depositRequestSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes de depósito
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">{t('admin.allWithdrawals')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.user')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.amount')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">FaucetPay</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.status')}</th>
                      <th 
                        className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setWithdrawalSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {t('admin.date')}
                          {withdrawalSortOrder === 'desc' ? (
                            <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals
                      .sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime();
                        const dateB = new Date(b.created_at).getTime();
                        return withdrawalSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                      })
                      .map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">
                          <div>{tx.user_email}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {tx.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-500">{formatDoge(tx.amount)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {tx.faucetpay_address?.slice(0, 20)}...
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Web Mining Tab */}
          <TabsContent value="webmining" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Cpu className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usuarios Minando Ahora</p>
                    <p className="text-2xl font-bold text-foreground">{webMiningSessions.length}</p>
                  </div>
                </div>
                <Button onClick={fetchWebMiningSessions} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              {webMiningSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay usuarios minando actualmente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Hashes</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hashes Pendientes</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Recompensas</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Última Actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webMiningSessions.map((session) => (
                        <tr key={session.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-sm">{session.user_email}</td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                            {session.total_hashes.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-500">
                            {session.hashes_pending.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-primary">
                            {formatDoge(session.total_rewards)} DOGE
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500">
                              <Activity className="w-3 h-3 animate-pulse" />
                              Minando
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                            {session.last_hash_at ? formatDate(session.last_hash_at) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Concurso de Referidos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {referralStats.filter(s => s.contest_referrals > 0).length} participantes
                    </p>
                  </div>
                </div>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email o código..."
                    value={referralSearchQuery}
                    onChange={(e) => setReferralSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {referralStats.slice(0, 3).map((stat, index) => (
                  <div 
                    key={stat.user_id}
                    className={`p-4 rounded-xl border ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30' :
                      'bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-600/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <span className="font-bold text-lg">#{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{stat.email || 'Sin email'}</p>
                    <p className="text-xs text-muted-foreground/70">@{stat.username || 'anónimo'}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Ref. Concurso:</span>
                      <span className="font-bold text-primary">{stat.contest_referrals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Ref. Total:</span>
                      <span className="font-mono text-muted-foreground">{stat.total_referrals}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Premio: </span>
                      <span className={`font-bold ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                      }`}>
                        {index === 0 ? '15' : index === 1 ? '10' : '6'} DOGE
                      </span>
                      {stat.contest_referrals < 10 && (
                        <span className="ml-2 text-xs text-destructive">(Mín. 10 ref.)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Username</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Código Referido</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ref. Concurso</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ref. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralStats
                      .filter(s => 
                        (s.email?.toLowerCase().includes(referralSearchQuery.toLowerCase()) ||
                         s.referral_code?.toLowerCase().includes(referralSearchQuery.toLowerCase()) ||
                         s.username?.toLowerCase().includes(referralSearchQuery.toLowerCase()))
                      )
                      .map((stat, index) => (
                        <tr key={stat.user_id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-sm font-medium">
                            {index + 1}
                            {index < 3 && stat.contest_referrals >= 10 && (
                              <span className="ml-1">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">{stat.email || 'Sin email'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">@{stat.username || 'anónimo'}</td>
                          <td className="py-3 px-4">
                            {stat.referral_code && (
                              <code className="text-xs bg-secondary px-2 py-1 rounded">{stat.referral_code}</code>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-mono ${stat.contest_referrals >= 10 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {stat.contest_referrals}
                            </span>
                            {stat.contest_referrals >= 10 && (
                              <span className="ml-1 text-emerald-500">✓</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                            {stat.total_referrals}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {referralStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay datos de referidos disponibles</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* RDOGE Tokens Tab */}
          <TabsContent value="rdoge-tokens" className="space-y-6">
            <div className="glass rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Coins className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Holders RDOGE</p>
                    <p className="text-2xl font-bold text-foreground">{rdogeTokens.length.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Tokens</p>
                    <p className="text-lg font-bold text-yellow-500">
                      {rdogeTokens.reduce((sum, t) => sum + Number(t.balance), 0).toLocaleString()} RDOGE
                    </p>
                  </div>
                  <div className="relative flex-1 max-w-md ml-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por email..."
                      value={rdogeSearchQuery}
                      onChange={(e) => setRdogeSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Add Tokens to User */}
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-yellow-500" />
                  Gestionar Tokens RDOGE
                </h3>
                
                {/* User Selection */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuario por email para asignar tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {searchQuery && filteredUsers.length > 0 && !selectedUserForTokens && (
                    <div className="max-h-40 overflow-y-auto bg-secondary/50 rounded-lg">
                      {filteredUsers.slice(0, 10).map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUserForTokens(user);
                            setSearchQuery("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-secondary/80 flex items-center justify-between"
                        >
                          <span className="text-sm">{user.email}</span>
                          <span className="text-xs text-muted-foreground">
                            {rdogeTokens.find(t => t.user_id === user.id)?.balance.toLocaleString() || 0} RDOGE
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedUserForTokens && (
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{selectedUserForTokens.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Balance actual: {rdogeTokens.find(t => t.user_id === selectedUserForTokens.id)?.balance.toLocaleString() || 0} RDOGE
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedUserForTokens(null)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Operation Type */}
                      <div className="flex gap-2 mb-3">
                        <Button
                          size="sm"
                          variant={tokenOperation === 'add' ? 'default' : 'outline'}
                          onClick={() => setTokenOperation('add')}
                          className={tokenOperation === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Añadir
                        </Button>
                        <Button
                          size="sm"
                          variant={tokenOperation === 'subtract' ? 'default' : 'outline'}
                          onClick={() => setTokenOperation('subtract')}
                          className={tokenOperation === 'subtract' ? 'bg-destructive hover:bg-destructive/90' : ''}
                        >
                          <Minus className="w-3 h-3 mr-1" />
                          Quitar
                        </Button>
                        <Button
                          size="sm"
                          variant={tokenOperation === 'set' ? 'default' : 'outline'}
                          onClick={() => setTokenOperation('set')}
                          className={tokenOperation === 'set' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                        >
                          <ArrowUpDown className="w-3 h-3 mr-1" />
                          Establecer
                        </Button>
                      </div>

                      {/* Amount Input */}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Cantidad de tokens RDOGE"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleModifyRdogeTokens}
                          disabled={modifyingTokens || !tokenAmount}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        >
                          {modifyingTokens ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aplicar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tokens Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance RDOGE</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Comprado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Última Actualización</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rdogeTokens
                      .filter(t => t.user_email?.toLowerCase().includes(rdogeSearchQuery.toLowerCase()))
                      .map((token, index) => (
                        <tr key={token.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-sm font-medium">{index + 1}</td>
                          <td className="py-3 px-4 text-sm">{token.user_email}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-yellow-500">{Number(token.balance).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">RDOGE</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                            {Number(token.total_purchased).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(token.updated_at)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const user = users.find(u => u.id === token.user_id);
                                if (user) {
                                  setSelectedUserForTokens(user);
                                  setTokenAmount(token.balance.toString());
                                  setTokenOperation('set');
                                }
                              }}
                              className="text-yellow-500 hover:text-yellow-400"
                            >
                              <ArrowUpDown className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {rdogeTokens.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay holders de RDOGE registrados</p>
                  <p className="text-sm">Asigna tokens a los usuarios usando el formulario de arriba</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2, History, Clock, CheckCircle, XCircle, AlertCircle, Dog, Copy, Send, AlertTriangle, ExternalLink } from "lucide-react";
import { formatDoge } from "@/data/dogeData";

const DAILY_LIMIT = 5.0000;
const MIN_DEPOSIT_FOR_WITHDRAWAL = 2;
const MIN_WITHDRAWAL = 0.5;
const FAUCETPAY_DEPOSIT_EMAIL = "rpgdoge30@gmail.com";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  faucetpay_address: string | null;
  created_at: string;
  type?: string;
}

const FaucetPaySection = () => {
  const { miningBalance, depositBalance, totalDeposited, canWithdraw, refreshBalance } = useDogeBalance();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // FaucetPay deposit state
  const [faucetPayDeposit, setFaucetPayDeposit] = useState<{
    deposit_id: string;
    verification_code: string;
    amount: number;
    payment_url: string;
    expires_at: string;
    recipient: string;
  } | null>(null);
  const [isCreatingFPDeposit, setIsCreatingFPDeposit] = useState(false);
  const [fpDepositAmount, setFpDepositAmount] = useState("");

  useEffect(() => {
    if (user) {
      fetchTransactions();
      checkPendingFaucetPayDeposit();
    }
  }, [user]);

  const checkPendingFaucetPayDeposit = async () => {
    if (!user) return;
    
    const { data: pendingDeposit } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    if (pendingDeposit) {
      const paymentUrl = `https://faucetpay.io/page/send-payment?to=rpgdoge30@gmail.com&amount=${Math.floor(pendingDeposit.amount * 100000000)}&currency=DOGE&custom=${pendingDeposit.verification_code}`;
      setFaucetPayDeposit({
        deposit_id: pendingDeposit.id,
        verification_code: pendingDeposit.verification_code,
        amount: pendingDeposit.amount,
        payment_url: paymentUrl,
        expires_at: pendingDeposit.expires_at,
        recipient: FAUCETPAY_DEPOSIT_EMAIL
      });
    }
  };

  // Polling to check if deposit was completed
  useEffect(() => {
    if (!faucetPayDeposit) return;

    const checkCompletion = async () => {
      try {
        await supabase.functions.invoke('faucetpay-ipn', {
          body: {},
          headers: {}
        });
      } catch (e) {
        // Ignore errors
      }

      const { data: deposit } = await supabase
        .from('deposits')
        .select('status')
        .eq('id', faucetPayDeposit.deposit_id)
        .single();

      if (deposit?.status === 'completed') {
        toast({
          title: "¡Depósito acreditado! 🎉",
          description: `${faucetPayDeposit.amount} DOGE agregados a tu balance`,
        });
        setFaucetPayDeposit(null);
        await refreshBalance();
        await fetchTransactions();
      } else if (deposit?.status === 'expired') {
        setFaucetPayDeposit(null);
        toast({
          title: "Depósito expirado",
          description: "El tiempo de depósito expiró. Crea uno nuevo.",
          variant: "destructive",
        });
      }
    };

    checkCompletion();
    const interval = setInterval(checkCompletion, 15000);
    return () => clearInterval(interval);
  }, [faucetPayDeposit]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('id, amount, status, faucetpay_address, created_at, type')
        .eq('user_id', user.id)
        .in('type', ['withdrawal', 'deposit'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txData || []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: dailyData, error: dailyError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal')
        .in('status', ['pending', 'completed'])
        .gte('created_at', todayISO);

      if (dailyError) throw dailyError;
      
      const total = dailyData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      setDailyUsed(total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWithdraw = async () => {
    if (!canWithdraw) {
      toast({
        title: "Requisito de depósito",
        description: `Debes haber depositado al menos ${MIN_DEPOSIT_FOR_WITHDRAWAL} DOGE para poder retirar. Has depositado: ${formatDoge(totalDeposited)} DOGE`,
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAddress.trim()) {
      toast({
        title: "Error",
        description: "Ingresa tu email de FaucetPay",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Ingresa una cantidad válida",
        variant: "destructive",
      });
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      toast({
        title: "Monto mínimo",
        description: `El mínimo de retiro es ${MIN_WITHDRAWAL} DOGE`,
        variant: "destructive",
      });
      return;
    }

    if (amount > miningBalance) {
      toast({
        title: "Balance insuficiente",
        description: "No tienes suficiente DOGE de minado para retirar",
        variant: "destructive",
      });
      return;
    }

    if (dailyUsed + amount > DAILY_LIMIT) {
      toast({
        title: "Límite diario excedido",
        description: `Solo puedes retirar ${formatDoge(DAILY_LIMIT - dailyUsed)} DOGE más hoy`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verificar dirección
      const { data: checkData, error: checkError } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'checkAddress', address: withdrawAddress, currency: 'DOGE' }
      });

      if (checkError) throw checkError;

      if (checkData.status !== 200) {
        throw new Error(checkData.message || 'Email de FaucetPay inválido');
      }

      // Enviar retiro
      const { data, error } = await supabase.functions.invoke('faucetpay', {
        body: { 
          action: 'send', 
          address: withdrawAddress, 
          amount: amount,
          currency: 'DOGE' 
        }
      });

      if (error) throw error;

      if (data.status === 200) {
        toast({
          title: "¡Retiro exitoso! 🎉",
          description: `Se enviaron ${formatDoge(amount)} DOGE a tu FaucetPay`,
        });
        setWithdrawAmount("");
        setWithdrawAddress("");
        await refreshBalance();
        await fetchTransactions();
      } else {
        throw new Error(data.message || 'Error al procesar el retiro');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Error en el retiro",
        description: error.message || "No se pudo procesar el retiro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const createFaucetPayDeposit = async () => {
    const amount = parseFloat(fpDepositAmount);
    
    if (isNaN(amount) || amount < 0.1) {
      toast({
        title: "Error",
        description: "El mínimo de depósito es 0.1 DOGE",
        variant: "destructive",
      });
      return;
    }

    if (amount > 100) {
      toast({
        title: "Error",
        description: "El máximo de depósito es 100 DOGE",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFPDeposit(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-faucetpay-deposit', {
        body: { amount }
      });

      if (error) throw error;

      if (data.success) {
        setFaucetPayDeposit(data);
        toast({
          title: "Depósito iniciado",
          description: `Envía ${amount} DOGE a ${data.recipient}`,
        });
        setFpDepositAmount("");
      } else {
        throw new Error(data.error || 'Error al crear depósito');
      }
    } catch (error: any) {
      console.error('Create FaucetPay deposit error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el depósito",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFPDeposit(false);
    }
  };

  const openFaucetPayPayment = () => {
    window.open('https://faucetpay.io/page/send-payment', '_blank');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const dailyPercentage = Math.min((dailyUsed / DAILY_LIMIT) * 100, 100);
  const remainingDaily = Math.max(DAILY_LIMIT - dailyUsed, 0);

  return (
    <section id="faucetpay" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">FaucetPay</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Depósitos y Retiros
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deposita y retira DOGE usando tu cuenta de FaucetPay. Sin comisiones de red. 🚀
          </p>
        </div>

        {/* Daily Limit Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Límite diario de retiro</span>
              <span className="text-sm text-muted-foreground">
                {formatDoge(dailyUsed)} / {formatDoge(DAILY_LIMIT)} DOGE
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  dailyPercentage >= 90 ? 'bg-destructive' : 
                  dailyPercentage >= 70 ? 'bg-amber-500' : 
                  'bg-gradient-to-r from-primary to-emerald-500'
                }`}
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Disponible hoy: <span className="font-semibold text-primary">{formatDoge(remainingDaily)} DOGE</span>
              {' '}• El límite se reinicia a medianoche UTC
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Withdraw Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <ArrowUpFromLine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Retirar DOGE</h3>
                <p className="text-sm text-muted-foreground">Envía a tu FaucetPay</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
              <p className="text-sm text-muted-foreground mb-1">Balance de minado (retirable)</p>
              <div className="flex items-center gap-2">
                <Dog className="w-6 h-6 text-emerald-500" />
                <p className="text-2xl font-bold text-emerald-500">{formatDoge(miningBalance)} DOGE</p>
              </div>
            </div>

            {!canWithdraw && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-600">Requisito de retiro</p>
                  <p className="text-xs text-muted-foreground">
                    Deposita al menos {MIN_DEPOSIT_FOR_WITHDRAWAL} DOGE para habilitar retiros.
                    Has depositado: {formatDoge(totalDeposited)} DOGE
                  </p>
                </div>
              </div>
            )}

            <Input
              placeholder="Tu email de FaucetPay"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-background/50"
            />

            <Input
              type="number"
              step="0.0001"
              placeholder="Cantidad a retirar"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-background/50"
            />

            <Button 
              onClick={handleWithdraw} 
              className="w-full gradient-primary text-primary-foreground"
              disabled={isLoading || !canWithdraw}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
              ) : !canWithdraw ? (
                <>🔒 Deposita {MIN_DEPOSIT_FOR_WITHDRAWAL} DOGE para retirar</>
              ) : (
                <><ArrowUpFromLine className="w-4 h-4 mr-2" /> Retirar</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Mínimo: {MIN_WITHDRAWAL} DOGE • Máximo diario: {formatDoge(DAILY_LIMIT)} DOGE
            </p>
          </div>

          {/* Deposit Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <ArrowDownToLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Depositar DOGE</h3>
                <p className="text-sm text-muted-foreground">Desde tu FaucetPay</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/30 space-y-3">
              <p className="text-sm font-medium">📧 Envía DOGE a este email:</p>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <code className="flex-1 text-sm font-mono break-all text-primary">
                  {FAUCETPAY_DEPOSIT_EMAIL}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(FAUCETPAY_DEPOSIT_EMAIL)}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <p className="text-sm font-medium mb-3">Iniciar depósito:</p>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                placeholder="Cantidad (0.1 - 100 DOGE)"
                value={fpDepositAmount}
                onChange={(e) => setFpDepositAmount(e.target.value)}
                className="bg-background/50 mb-3"
              />
              <Button
                onClick={createFaucetPayDeposit}
                className="w-full gradient-primary text-primary-foreground"
                disabled={isCreatingFPDeposit || !!faucetPayDeposit}
              >
                {isCreatingFPDeposit ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</>
                ) : faucetPayDeposit ? (
                  <>Tienes un depósito pendiente</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Iniciar Depósito</>
                )}
              </Button>
            </div>

            {faucetPayDeposit && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <p className="text-sm font-medium text-emerald-600">📋 Depósito pendiente:</p>
                <div className="text-xs space-y-3">
                  <div className="p-3 bg-background/50 rounded-lg space-y-2">
                    <p className="font-medium">1. Cantidad a enviar:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-lg font-bold text-primary">{faucetPayDeposit.amount} DOGE</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(faucetPayDeposit.amount.toString())}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg space-y-2">
                    <p className="font-medium">2. Enviar a:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-primary break-all">{faucetPayDeposit.recipient}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(faucetPayDeposit.recipient)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="font-medium">3. Moneda: <span className="text-primary">DOGE</span></p>
                  </div>
                  <Button
                    onClick={openFaucetPayPayment}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ir a FaucetPay
                  </Button>
                  <p className="text-muted-foreground text-center">Se acreditará automáticamente tras enviar.</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm font-medium text-amber-600 mb-2">💡 Instrucciones:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Mínimo: <span className="font-bold text-primary">0.1 DOGE</span> - Máximo: 100 DOGE</li>
                <li>Entra a FaucetPay → Send Payment</li>
                <li>El depósito se acredita automáticamente en segundos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Historial de transacciones</h3>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay transacciones aún
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-3">
                      {tx.type === 'withdrawal' ? (
                        <ArrowUpFromLine className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {tx.type === 'withdrawal' ? 'Retiro' : 'Depósito'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-primary' : 'text-emerald-500'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatDoge(tx.amount)} DOGE
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        {getStatusIcon(tx.status)}
                        <span className="text-xs text-muted-foreground">{getStatusLabel(tx.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaucetPaySection;

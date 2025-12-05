import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2, History, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const DAILY_LIMIT = 50000;

interface Transaction {
  id: string;
  amount: number;
  status: string;
  faucetpay_address: string | null;
  created_at: string;
}

const FaucetPaySection = () => {
  const { balance, subtractBalance, addBalance, refreshBalance } = useBonkBalance();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faucetPayBalance, setFaucetPayBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch transaction history and daily usage
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('id, amount, status, faucetpay_address, created_at')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txData || []);

      // Calculate daily usage
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

  const checkFaucetPayBalance = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'getBalance', currency: 'BONK' }
      });

      if (error) throw error;

      if (data.status === 200) {
        setFaucetPayBalance(parseFloat(data.balance));
        toast({
          title: "Balance actualizado",
          description: `Balance FaucetPay: ${data.balance} BONK`,
        });
      } else {
        throw new Error(data.message || 'Error al obtener balance');
      }
    } catch (error: any) {
      console.error('Error checking balance:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar el balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress.trim()) {
      toast({
        title: "Error",
        description: "Ingresa tu dirección de FaucetPay",
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

    if (amount > balance) {
      toast({
        title: "Balance insuficiente",
        description: "No tienes suficiente BONK para retirar",
        variant: "destructive",
      });
      return;
    }

    // Check daily limit
    if (dailyUsed + amount > DAILY_LIMIT) {
      toast({
        title: "Límite diario excedido",
        description: `Solo puedes retirar ${formatNumber(DAILY_LIMIT - dailyUsed)} BONK más hoy`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if the address is valid
      const { data: checkData, error: checkError } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'checkAddress', address: withdrawAddress, currency: 'BONK' }
      });

      if (checkError) throw checkError;

      if (checkData.status !== 200) {
        throw new Error(checkData.message || 'Dirección inválida');
      }

      // Send the withdrawal
      const { data, error } = await supabase.functions.invoke('faucetpay', {
        body: { 
          action: 'send', 
          address: withdrawAddress, 
          amount: amount,
          currency: 'BONK' 
        }
      });

      if (error) throw error;

      if (data.status === 200) {
        toast({
          title: "¡Retiro exitoso!",
          description: `Se enviaron ${amount} BONK a tu cuenta de FaucetPay`,
        });
        setWithdrawAmount("");
        setWithdrawAddress("");
        // Refresh balance and transactions
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

  const handleCheckDeposit = async () => {
    if (!depositAddress.trim()) {
      toast({
        title: "Error",
        description: "Ingresa tu dirección de FaucetPay para verificar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'checkAddress', address: depositAddress, currency: 'BONK' }
      });

      if (error) throw error;

      if (data.status === 200) {
        // Bonus for linking account
        const depositAmount = 1000;
        const success = await addBalance(depositAmount);
        if (success) {
          toast({
            title: "¡Cuenta vinculada!",
            description: `Recibiste ${depositAmount} BONK de bienvenida por vincular tu cuenta`,
          });
          setDepositAddress("");
        }
      } else {
        throw new Error(data.message || 'Dirección no encontrada en FaucetPay');
      }
    } catch (error: any) {
      console.error('Deposit check error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar la dirección",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
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
            <span className="text-sm font-medium">FaucetPay Integration</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Depósitos y Retiros
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conecta tu cuenta de FaucetPay para depositar y retirar tu BONK de forma segura
          </p>
        </div>

        {/* Daily Limit Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Límite diario de retiro</span>
              <span className="text-sm text-muted-foreground">
                {formatNumber(dailyUsed)} / {formatNumber(DAILY_LIMIT)} BONK
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
              Disponible hoy: <span className="font-semibold text-primary">{formatNumber(remainingDaily)} BONK</span>
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
                <h3 className="text-xl font-bold">Retirar BONK</h3>
                <p className="text-sm text-muted-foreground">Envía a tu FaucetPay</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Tu balance disponible</p>
              <p className="text-2xl font-bold text-gradient">{formatNumber(balance)} BONK</p>
            </div>

            <Input
              placeholder="Tu email de FaucetPay"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-background/50"
            />

            <Input
              type="number"
              placeholder="Cantidad a retirar"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-background/50"
            />

            <Button 
              onClick={handleWithdraw} 
              className="w-full gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <><ArrowUpFromLine className="w-4 h-4 mr-2" /> Retirar</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Mínimo: 100 BONK • Máximo diario: {formatNumber(DAILY_LIMIT)} BONK
            </p>
          </div>

          {/* Deposit Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <ArrowDownToLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Depositar BONK</h3>
                <p className="text-sm text-muted-foreground">Vincula tu cuenta</p>
              </div>
            </div>

            {faucetPayBalance !== null && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-muted-foreground mb-1">Balance en FaucetPay</p>
                <p className="text-2xl font-bold text-emerald-500">{formatNumber(faucetPayBalance)} BONK</p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
              <p className="text-sm font-medium">¿Cómo depositar?</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Ingresa tu email de FaucetPay</li>
                <li>Verifica tu cuenta</li>
                <li>Recibe bonus de bienvenida</li>
              </ol>
            </div>

            <Input
              placeholder="Tu email de FaucetPay"
              value={depositAddress}
              onChange={(e) => setDepositAddress(e.target.value)}
              className="bg-background/50"
            />

            <Button 
              onClick={handleCheckDeposit} 
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
              ) : (
                <><ArrowDownToLine className="w-4 h-4 mr-2" /> Vincular Cuenta</>
              )}
            </Button>

            <Button 
              onClick={checkFaucetPayBalance} 
              variant="ghost"
              className="w-full"
              disabled={isLoading}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Ver Balance FaucetPay
            </Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <History className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Historial de Retiros</h3>
                <p className="text-sm text-muted-foreground">Tus últimas transacciones</p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay transacciones aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <p className="font-medium text-sm">
                          -{formatNumber(tx.amount)} BONK
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.faucetpay_address ? `→ ${tx.faucetpay_address.slice(0, 20)}...` : 'FaucetPay'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                        tx.status === 'failed' ? 'bg-destructive/20 text-destructive' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {getStatusLabel(tx.status)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(tx.created_at)}
                      </p>
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

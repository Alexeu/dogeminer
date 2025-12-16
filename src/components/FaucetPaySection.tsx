import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2, History, Clock, CheckCircle, XCircle, AlertCircle, Dog, Copy } from "lucide-react";
import { formatDoge } from "@/data/dogeData";

const DAILY_LIMIT = 5.0000;
const MIN_WITHDRAWAL = 0.5;
const MIN_DEPOSIT = 1;
const DOGE_DEPOSIT_ADDRESS = "DFbsc22DdbvczjXJZfTu59Q7HdSFkeGUNv";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  faucetpay_address: string | null;
  created_at: string;
  type?: string;
}

const FaucetPaySection = () => {
  const { balance, refreshBalance } = useDogeBalance();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faucetPayBalance, setFaucetPayBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);


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

  const checkFaucetPayBalance = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'getBalance', currency: 'DOGE' }
      });

      if (error) throw error;

      if (data.status === 200) {
        setFaucetPayBalance(parseFloat(data.balance));
        toast({
          title: "Balance actualizado",
          description: `Balance FaucetPay: ${formatDoge(parseFloat(data.balance))} DOGE`,
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

    if (amount < MIN_WITHDRAWAL) {
      toast({
        title: "Monto mínimo no alcanzado",
        description: `El mínimo de retiro es ${MIN_WITHDRAWAL} DOGE`,
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Balance insuficiente",
        description: "No tienes suficiente DOGE para retirar",
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
      const { data: checkData, error: checkError } = await supabase.functions.invoke('faucetpay', {
        body: { action: 'checkAddress', address: withdrawAddress, currency: 'DOGE' }
      });

      if (checkError) throw checkError;

      if (checkData.status !== 200) {
        throw new Error(checkData.message || 'Dirección inválida');
      }

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
          title: "¡Retiro exitoso! Much wow!",
          description: `Se enviaron ${formatDoge(amount)} DOGE a tu cuenta de FaucetPay`,
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
            <span className="text-sm font-medium">FaucetPay Integration</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Depósitos y Retiros
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-comic">
            Conecta tu cuenta de FaucetPay para depositar y retirar tu DOGE. Much secure! 🔐
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

            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Tu balance disponible</p>
              <div className="flex items-center gap-2">
                <Dog className="w-6 h-6 text-primary" />
                <p className="text-2xl font-bold text-gradient">{formatDoge(balance)} DOGE</p>
              </div>
            </div>

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
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
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
                <p className="text-sm text-muted-foreground">Envía DOGE a nuestra dirección</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <p className="text-sm font-medium">Dirección de depósito DOGE:</p>
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <code className="flex-1 text-sm font-mono break-all text-primary">
                  {DOGE_DEPOSIT_ADDRESS}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(DOGE_DEPOSIT_ADDRESS)}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm font-medium text-amber-600 mb-2">⚠️ Importante:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Mínimo de depósito: <span className="font-bold">{MIN_DEPOSIT} DOGE</span></li>
                <li>Solo envía DOGE a esta dirección</li>
                <li>Los depósitos se procesan manualmente</li>
                <li>Contacta soporte después de enviar</li>
              </ul>
            </div>

            <Button
              onClick={checkFaucetPayBalance} 
              variant="ghost"
              className="w-full"
              disabled={isLoading}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Ver Balance FaucetPay
            </Button>

            {faucetPayBalance !== null && (
              <div className="p-3 rounded-xl bg-secondary/30 text-center">
                <p className="text-xs text-muted-foreground">Balance en FaucetPay</p>
                <p className="font-bold text-emerald-500">{formatDoge(faucetPayBalance)} DOGE</p>
              </div>
            )}
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
                <h3 className="text-lg font-bold">Historial de Transacciones</h3>
                <p className="text-sm text-muted-foreground">Depósitos y retiros</p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay transacciones aún. Such empty! 🐕</p>
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
                          {tx.type === 'deposit' ? '+' : '-'}{formatDoge(tx.amount)} DOGE
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.type === 'deposit' ? 'Depósito' : 'Retiro'} 
                          {tx.faucetpay_address ? ` • ${tx.faucetpay_address.slice(0, 15)}...` : ''}
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

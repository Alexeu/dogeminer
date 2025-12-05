import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

const FaucetPaySection = () => {
  const { balance, subtractBalance, addBalance } = useBonkBalance();
  const { toast } = useToast();
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faucetPayBalance, setFaucetPayBalance] = useState<number | null>(null);

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
        const success = await subtractBalance(amount);
        if (success) {
          toast({
            title: "¡Retiro exitoso!",
            description: `Se enviaron ${amount} BONK a tu cuenta de FaucetPay`,
          });
          setWithdrawAmount("");
          setWithdrawAddress("");
        }
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
              Mínimo: 100 BONK • Máximo: 1,000,000 BONK
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
      </div>
    </section>
  );
};

export default FaucetPaySection;

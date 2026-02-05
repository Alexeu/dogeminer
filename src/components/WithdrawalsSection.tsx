import { CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface WithdrawalData {
  id: string;
  amount: number;
  created_at: string;
  faucetpay_address: string | null;
}

const WithdrawalsSection = () => {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['latest-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, created_at, faucetpay_address')
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as WithdrawalData[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const maskAddress = (address: string | null) => {
    if (!address) return "user...";
    if (address.length <= 8) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 3)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: es 
    });
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Últimos Retiros
          </h2>
          <p className="text-muted-foreground">Usuarios reales, ganancias reales</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : withdrawals && withdrawals.length > 0 ? (
              <div className="divide-y divide-border">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {(withdrawal.faucetpay_address || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{maskAddress(withdrawal.faucetpay_address)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(withdrawal.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gradient">
                        {withdrawal.amount.toFixed(6)} DOGE
                      </span>
                      <span className="flex items-center gap-1 text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                <p>Aún no hay retiros completados</p>
                <p className="text-sm mt-2">¡Sé el primero en retirar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WithdrawalsSection;

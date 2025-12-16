import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Copy
} from "lucide-react";
import { formatDoge } from "@/data/dogeData";

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

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

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
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchPendingDeposits();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDeposits = async () => {
    try {
      // Fetch pending deposits
      const { data: deposits, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails for each deposit
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
      console.error('Fetch deposits error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los depósitos",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      // Add balance to user
      const { data: addResult, error: addError } = await supabase.rpc('admin_add_balance', {
        p_user_id: deposit.user_id,
        p_amount: deposit.amount
      });

      if (addError) throw addError;

      const result = addResult as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add balance');
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          notes: `Aprobado por admin. ${deposit.notes || ''}`
        })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      // Create notification for user
      await supabase.functions.invoke('notify-admin-deposit', {
        body: {
          action: 'notify_user',
          user_id: deposit.user_id,
          amount: deposit.amount,
          status: 'approved'
        }
      });

      toast({
        title: "Depósito aprobado",
        description: `${formatDoge(deposit.amount)} DOGE acreditados a ${deposit.user_email}`,
      });

      fetchPendingDeposits();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el depósito",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    try {
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          notes: `Rechazado por admin. ${deposit.notes || ''}`
        })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      toast({
        title: "Depósito rechazado",
        description: `El depósito de ${deposit.user_email} fue rechazado`,
      });

      fetchPendingDeposits();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar el depósito",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "TX Hash copiado" });
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
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </div>
          </div>
          <Button onClick={fetchPendingDeposits} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Pending Deposits */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold">Depósitos Pendientes</h2>
            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm">
              {pendingDeposits.length}
            </span>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay depósitos pendientes 🎉</p>
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
                        <span className="text-lg font-bold text-primary">
                          {formatDoge(deposit.amount)} DOGE
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                          Pendiente
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Usuario: <span className="font-medium text-foreground">{deposit.user_email}</span></p>
                        <p>Fecha: {formatDate(deposit.created_at)}</p>
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
                            Aprobar
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
      </div>
    </div>
  );
};

export default Admin;

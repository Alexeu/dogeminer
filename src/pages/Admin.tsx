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
  Activity
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
  
  // Deposits state
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [allDeposits, setAllDeposits] = useState<Transaction[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [depositSearchQuery, setDepositSearchQuery] = useState("");
  const [depositRequestSearchQuery, setDepositRequestSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  
  // Web Mining state
  const [webMiningSessions, setWebMiningSessions] = useState<WebMiningSession[]>([]);

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
      fetchWebMiningSessions()
    ]);
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
      const { data: deposits, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(50);

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
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const txsWithEmails = await Promise.all(
        (txs || []).map(async (tx) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', tx.user_id)
            .single();
          
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

  const handleAddBalance = async () => {
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
      const { data, error } = await supabase.rpc('admin_add_balance', {
        p_user_id: selectedUser.id,
        p_amount: amount
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add balance');
      }

      toast({
        title: t('common.success'),
        description: `${formatDoge(amount)} DOGE agregados a ${selectedUser.email}`,
      });

      setAddBalanceAmount("");
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: any) {
      console.error('Add balance error:', error);
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
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

              {/* Add Balance Modal */}
              {selectedUser && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('admin.addBalanceToUser')}: {selectedUser.email}
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder={t('admin.amountToAdd')}
                      value={addBalanceAmount}
                      onChange={(e) => setAddBalanceAmount(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button onClick={handleAddBalance} disabled={addingBalance}>
                      {addingBalance ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.add')}
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Minado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Depósito</th>
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
                            <Plus className="w-3 h-3 mr-1" />
                            {t('admin.addBalance')}
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
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.amount')}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.status')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDeposits
                      .filter(tx => 
                        !depositSearchQuery ||
                        tx.user_email?.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
                        tx.faucetpay_address?.toLowerCase().includes(depositSearchQuery.toLowerCase())
                      )
                      .map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">{tx.user_email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{tx.faucetpay_address || '-'}</td>
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
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Creado</th>
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
                      .map((req) => (
                      <tr key={req.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">{req.user_email}</td>
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
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">{tx.user_email}</td>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

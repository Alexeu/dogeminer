import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link, ExternalLink, CheckCircle, Clock, Gift } from "lucide-react";
import { formatDoge } from "@/data/dogeData";

interface Shortlink {
  id: string;
  name: string;
  provider: string;
  reward: number;
  description: string;
  color: string;
}

const shortlinks: Shortlink[] = [
  {
    id: 'adfly',
    name: 'Adfly',
    provider: 'adfly',
    reward: 0.055,
    description: 'Completa el shortlink de Adfly para ganar recompensas.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'earnnow',
    name: 'EarnNow.online',
    provider: 'earnnow',
    reward: 0.055,
    description: 'Completa el shortlink de EarnNow para ganar recompensas.',
    color: 'from-green-500 to-green-600'
  }
];

export const ShortlinksSection = () => {
  const { user } = useAuth();
  const { refreshBalance } = useDogeBalance();
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkCompletedToday();
    }
  }, [user]);

  const checkCompletedToday = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('shortlink_completions')
      .select('provider')
      .eq('user_id', user.id)
      .gte('completed_at', today.toISOString());

    if (data) {
      const completed: Record<string, boolean> = {};
      data.forEach((item: { provider: string }) => {
        completed[item.provider] = true;
      });
      setCompletedToday(completed);
    }
  };

  const startShortlink = (shortlink: Shortlink) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar shortlinks",
        variant: "destructive",
      });
      return;
    }

    if (completedToday[shortlink.provider]) {
      toast({
        title: "Ya completado",
        description: "Ya has completado este shortlink hoy. Vuelve mañana.",
        variant: "destructive",
      });
      return;
    }

    // Generate a verification token
    const verificationToken = `${user.id}_${shortlink.provider}_${Date.now()}`;
    
    // Build the shortlink URL based on provider
    let shortlinkUrl = '';
    if (shortlink.provider === 'adfly') {
      shortlinkUrl = 'https://adfly.site/PEPERPG';
    } else if (shortlink.provider === 'earnnow') {
      shortlinkUrl = 'http://earnow.online/EK8f';
    }

    setActiveLink(shortlink.provider);
    
    // Open shortlink in new tab
    window.open(shortlinkUrl, '_blank');

    toast({
      title: "Shortlink abierto",
      description: "Completa el shortlink en la nueva pestaña y luego haz clic en 'Reclamar recompensa'.",
    });
  };

  const claimReward = async (shortlink: Shortlink) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [shortlink.provider]: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('shortlink-callback', {
        body: {
          provider: shortlink.provider,
          verificationToken: `${user.id}_${shortlink.provider}_verified`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "¡Recompensa reclamada!",
          description: `Has ganado ${formatDoge(shortlink.reward)} DOGE`,
        });
        setCompletedToday(prev => ({ ...prev, [shortlink.provider]: true }));
        setActiveLink(null);
        refreshBalance();
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo reclamar la recompensa",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [shortlink.provider]: false }));
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Link className="w-6 h-6" />
          Shortlinks
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Completa shortlinks para ganar DOGE. Cada shortlink se puede completar una vez al día.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {shortlinks.map((shortlink) => {
            const isCompleted = completedToday[shortlink.provider];
            const isActive = activeLink === shortlink.provider;
            const isLoading = loading[shortlink.provider];

            return (
              <div
                key={shortlink.id}
                className={`relative overflow-hidden rounded-xl border ${
                  isCompleted 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : 'border-primary/30 bg-gradient-to-br ' + shortlink.color + '/10'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{shortlink.name}</h3>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className="flex items-center gap-1 text-primary">
                        <Gift className="w-4 h-4" />
                        <span className="font-mono font-bold">{formatDoge(shortlink.reward)} DOGE</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {shortlink.description}
                  </p>

                  <div className="flex gap-2">
                    {!isCompleted && !isActive && (
                      <Button
                        onClick={() => startShortlink(shortlink)}
                        className={`flex-1 bg-gradient-to-r ${shortlink.color} hover:opacity-90`}
                        disabled={!user}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Shortlink
                      </Button>
                    )}
                    
                    {isActive && (
                      <Button
                        onClick={() => claimReward(shortlink)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Reclamar Recompensa
                          </>
                        )}
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        disabled
                        variant="outline"
                        className="flex-1 border-green-500/50 text-green-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completado Hoy
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

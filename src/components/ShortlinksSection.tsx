import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link, ExternalLink, CheckCircle, Clock, Gift, Timer } from "lucide-react";
import { formatDoge } from "@/data/dogeData";

interface Shortlink {
  id: string;
  name: string;
  provider: string;
  reward: number;
  description: string;
  color: string;
  waitTime: number; // seconds to wait before claiming
}

const shortlinks: Shortlink[] = [
  {
    id: 'adfly',
    name: 'Adfly',
    provider: 'adfly',
    reward: 0.01,
    description: 'Completa el shortlink de Adfly para ganar recompensas.',
    color: 'from-blue-500 to-blue-600',
    waitTime: 30
  },
  {
    id: 'eazyurl',
    name: 'EazyURL',
    provider: 'eazyurl',
    reward: 0.01,
    description: 'Completa el shortlink de EazyURL para ganar recompensas.',
    color: 'from-purple-500 to-purple-600',
    waitTime: 30
  }

  {
    id: 'shrink',
    name: 'Shrink',
    provider: 'shrink',
    reward: 0.01,
    description: 'Completa el shortlink de Shrink para ganar recompensas.',
    color: 'from-green-500 to-green-600',
    waitTime: 30
  }
  
];

export const ShortlinksSection = () => {
  const { user } = useAuth();
  const { refreshBalance } = useDogeBalance();
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Record<string, number>>({});
  const [countdown, setCountdown] = useState<Record<string, number>>({});
  const [completedUrl, setCompletedUrl] = useState<Record<string, string>>({});
  const intervalRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Check completed shortlinks on mount and when user changes
  useEffect(() => {
    if (user) {
      checkCompletedToday();
    }
  }, [user]);

  // Also check when component becomes visible (section change)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        checkCompletedToday();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRef.current).forEach(interval => clearInterval(interval));
    };
  }, []);

  // Listen for when user returns from shortlink
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeLink) {
        // User returned to the page - capture the referrer or mark as completed
        const currentUrl = document.referrer || window.location.href;
        setCompletedUrl(prev => ({ ...prev, [activeLink]: currentUrl }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeLink]);

  const checkCompletedToday = async () => {
    if (!user) return;

    // Check for completions TODAY (daily limit)
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

  const startCountdown = (provider: string, waitTime: number) => {
    // Clear any existing interval for this provider
    if (intervalRef.current[provider]) {
      clearInterval(intervalRef.current[provider]);
    }

    setCountdown(prev => ({ ...prev, [provider]: waitTime }));

    intervalRef.current[provider] = setInterval(() => {
      setCountdown(prev => {
        const newValue = (prev[provider] || 0) - 1;
        if (newValue <= 0) {
          clearInterval(intervalRef.current[provider]);
          return { ...prev, [provider]: 0 };
        }
        return { ...prev, [provider]: newValue };
      });
    }, 1000);
  };

  const startShortlink = async (shortlink: Shortlink) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar shortlinks",
        variant: "destructive",
      });
      return;
    }

    // Always verify in database first (prevents bypass)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingCompletion } = await supabase
      .from('shortlink_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', shortlink.provider)
      .gte('completed_at', today.toISOString())
      .maybeSingle();

    if (existingCompletion) {
      setCompletedToday(prev => ({ ...prev, [shortlink.provider]: true }));
      toast({
        title: "Ya completado",
        description: "Ya has completado este shortlink hoy. Vuelve mañana.",
        variant: "destructive",
      });
      return;
    }

    // Build the shortlink URL based on provider
    let shortlinkUrl = '';
    if (shortlink.provider === 'adfly') {
      shortlinkUrl = 'https://adfly.site/PEPERPG';
    } else if (shortlink.provider === 'eazyurl') {
      shortlinkUrl = 'https://eazyurl.xyz/LpSXh';
    }
    else if (shortlink.provider === 'shrink') {
      shortlinkUrl = 'https://shrinkme.click/PEPEminer';
    }

    // Record start time
    const now = Date.now();
    setStartTime(prev => ({ ...prev, [shortlink.provider]: now }));
    setActiveLink(shortlink.provider);
    
    // Start countdown
    startCountdown(shortlink.provider, shortlink.waitTime);
    
    // Open shortlink in new tab
    window.open(shortlinkUrl, '_blank');

    toast({
      title: "Shortlink abierto",
      description: `Completa el shortlink y espera ${shortlink.waitTime} segundos para reclamar tu recompensa.`,
    });
  };

  const canClaim = (provider: string): boolean => {
    return (countdown[provider] || 0) <= 0 && activeLink === provider;
  };

  const claimReward = async (shortlink: Shortlink) => {
    if (!user) return;

    // First, verify in database that user hasn't completed this shortlink today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingCompletion } = await supabase
      .from('shortlink_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', shortlink.provider)
      .gte('completed_at', today.toISOString())
      .maybeSingle();

    if (existingCompletion) {
      setCompletedToday(prev => ({ ...prev, [shortlink.provider]: true }));
      toast({
        title: "Ya completado",
        description: "Ya has completado este shortlink hoy. Vuelve mañana.",
        variant: "destructive",
      });
      return;
    }

    // Check if enough time has passed
    const elapsed = (Date.now() - (startTime[shortlink.provider] || 0)) / 1000;
    if (elapsed < shortlink.waitTime) {
      const remaining = Math.ceil(shortlink.waitTime - elapsed);
      toast({
        title: "Espera un momento",
        description: `Debes esperar ${remaining} segundos más para reclamar la recompensa.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, [shortlink.provider]: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const verificationToken = `${user.id}_${shortlink.provider}_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('shortlink-callback', {
        body: {
          provider: shortlink.provider,
          verificationToken: verificationToken
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
        setStartTime(prev => ({ ...prev, [shortlink.provider]: 0 }));
        setCountdown(prev => ({ ...prev, [shortlink.provider]: 0 }));
        setCompletedUrl(prev => ({ ...prev, [shortlink.provider]: '' }));
        if (intervalRef.current[shortlink.provider]) {
          clearInterval(intervalRef.current[shortlink.provider]);
        }
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
            const remainingTime = countdown[shortlink.provider] || 0;
            const canClaimNow = canClaim(shortlink.provider);
            const progress = isActive ? ((shortlink.waitTime - remainingTime) / shortlink.waitTime) * 100 : 0;

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

                  {/* Progress bar when waiting */}
                  {isActive && remainingTime > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Timer className="w-4 h-4" />
                          Esperando...
                        </span>
                        <span className="font-mono font-bold text-amber-500">
                          {remainingTime}s
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

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
                        className={`flex-1 ${
                          canClaimNow 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' 
                            : 'bg-muted cursor-not-allowed'
                        }`}
                        disabled={isLoading || !canClaimNow}
                      >
                        {isLoading ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : !canClaimNow ? (
                          <>
                            <Timer className="w-4 h-4 mr-2" />
                            Completa el shortlink ({remainingTime}s)
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

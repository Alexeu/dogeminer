import { useState, useEffect, useCallback } from 'react';
import { Gift, Twitter, Send, MessageCircle, Facebook, Check, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialTask {
  id: string;
  type: string;
  icon: React.ElementType;
  name: string;
  color: string;
  shareUrl: string;
}

const SHARE_TEXT = "🐕 ¡Gana DOGE gratis con DogeMiner! Colecciona personajes, mina 24/7 y retira al instante. ¡Únete ahora! 🚀";
const SHARE_URL = "https://rpg-doge-faucet.lovable.app";

const SocialTasksSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const tasks: SocialTask[] = [
    {
      id: 'twitter',
      type: 'twitter_share',
      icon: Twitter,
      name: 'Twitter/X',
      color: 'bg-black hover:bg-gray-800',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`,
    },
    {
      id: 'telegram',
      type: 'telegram_share',
      icon: Send,
      name: 'Telegram',
      color: 'bg-[#0088cc] hover:bg-[#006699]',
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
    },
    {
      id: 'whatsapp',
      type: 'whatsapp_share',
      icon: MessageCircle,
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#128C7E]',
      shareUrl: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL)}`,
    },
    {
      id: 'facebook',
      type: 'facebook_share',
      icon: Facebook,
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}&quote=${encodeURIComponent(SHARE_TEXT)}`,
    },
  ];

  const fetchCompletedTasks = useCallback(async () => {
    if (!user) {
      setLoadingTasks(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_tasks')
        .select('task_type')
        .eq('user_id', user.id);

      if (error) throw error;

      setCompletedTasks(data?.map((t) => t.task_type) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  const handleShare = (task: SocialTask) => {
    if (!user) {
      toast.error(t('tasks.loginRequired') || 'Inicia sesión para completar tareas');
      return;
    }

    if (completedTasks.includes(task.type)) {
      toast.info(t('tasks.alreadyCompleted') || 'Ya completaste esta tarea');
      return;
    }

    // Open share window
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const shareWindow = window.open(
      task.shareUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    setPendingTask(task.type);

    // Check if window was closed (user completed the share)
    const checkWindowClosed = setInterval(async () => {
      if (shareWindow?.closed) {
        clearInterval(checkWindowClosed);
        await completeTask(task.type);
      }
    }, 500);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(checkWindowClosed);
      if (pendingTask === task.type) {
        setPendingTask(null);
      }
    }, 120000);
  };

  const completeTask = async (taskType: string) => {
    try {
      const { data, error } = await supabase.rpc('complete_social_task', {
        p_task_type: taskType,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; reward?: number };

      if (result.success) {
        setCompletedTasks((prev) => [...prev, taskType]);
        toast.success(
          `${t('tasks.completed') || '¡Tarea completada!'} +${result.reward} DOGE 🎉`
        );
      } else if (result.error === 'already_completed') {
        toast.info(t('tasks.alreadyCompleted') || 'Ya completaste esta tarea');
        setCompletedTasks((prev) => [...prev, taskType]);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(t('tasks.error') || 'Error al completar la tarea');
    } finally {
      setPendingTask(null);
    }
  };

  const completedCount = completedTasks.length;
  const totalReward = completedCount * 0.25;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-comic border border-primary/30 mb-4">
            <Gift className="w-5 h-5" />
            <span className="font-bold">{t('tasks.badge') || '¡Gana DOGE Gratis!'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">{t('tasks.title') || 'Tareas '}</span>
            <span className="text-gradient">{t('tasks.titleHighlight') || 'Sociales'}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('tasks.subtitle') || 'Comparte el proyecto en redes sociales y gana 0.25 DOGE por cada tarea completada. ¡Solo puedes completar cada tarea una vez!'}
          </p>
        </div>

        <Card className="glass border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Gift className="w-5 h-5 text-primary" />
              {t('tasks.rewardPerTask') || '0.25 DOGE por tarea'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('tasks.progress') || 'Progreso'}: {completedCount}/{tasks.length} • {t('tasks.earned') || 'Ganado'}: {totalReward.toFixed(2)} DOGE
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingTasks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tasks.map((task) => {
                  const isCompleted = completedTasks.includes(task.type);
                  const isPending = pendingTask === task.type;

                  return (
                    <Button
                      key={task.id}
                      onClick={() => handleShare(task)}
                      disabled={isCompleted || isPending || !user}
                      className={`h-auto py-4 px-6 flex items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-green-600 hover:bg-green-600 cursor-default'
                          : !user
                          ? 'bg-muted hover:bg-muted cursor-not-allowed'
                          : task.color
                      } text-white transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <task.icon className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-semibold">{task.name}</p>
                          <p className="text-xs opacity-80">
                            {isCompleted
                              ? t('tasks.done') || 'Completado ✓'
                              : !user
                              ? t('tasks.loginFirst') || 'Inicia sesión'
                              : t('tasks.shareToEarn') || 'Comparte y gana 0.25 DOGE'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : !user ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded">
                            +0.25
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {!user && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('tasks.loginPrompt') || 'Inicia sesión para desbloquear las tareas y ganar recompensas.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SocialTasksSection;

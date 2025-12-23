import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useWebMiner } from "@/hooks/useWebMiner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { 
  Cpu, 
  Play, 
  Square, 
  Zap, 
  Hash, 
  Coins, 
  TrendingUp,
  AlertCircle,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const WebMiningSection = () => {
  const { stats, startMining, stopMining, setThreads, isSupported } = useWebMiner();
  const { language } = useLanguage();
  const { refreshBalance } = useDogeBalance();
  const [showSettings, setShowSettings] = useState(false);

  const texts = {
    title: { es: 'Minería Web DOGE', en: 'DOGE Web Mining' },
    subtitle: {
      es: 'Usa tu CPU para minar y ganar DOGE', 
      en: 'Use your CPU to mine and earn DOGE' 
    },
    startMining: { es: 'Iniciar Minería', en: 'Start Mining' },
    stopMining: { es: 'Detener Minería', en: 'Stop Mining' },
    hashRate: { es: 'Velocidad', en: 'Hash Rate' },
    totalHashes: { es: 'Hashes Totales', en: 'Total Hashes' },
    sessionHashes: { es: 'Sesión Actual', en: 'Current Session' },
    pendingHashes: { es: 'Hashes Pendientes', en: 'Pending Hashes' },
    totalRewards: { es: 'Recompensas Totales', en: 'Total Rewards' },
    hashesUntilReward: { es: 'Para próxima recompensa', en: 'Until next reward' },
    threads: { es: 'Hilos CPU', en: 'CPU Threads' },
    rewardRate: { es: '0.01 DOGE por cada 100,000 hashes', en: '0.01 DOGE per 100,000 hashes' },
    mining: { es: 'Minando...', en: 'Mining...' },
    notSupported: { es: 'Tu navegador no soporta minería web', en: 'Your browser does not support web mining' },
    settings: { es: 'Configuración', en: 'Settings' },
    warning: { 
      es: 'La minería usa recursos de tu CPU. Puede afectar el rendimiento de tu dispositivo.', 
      en: 'Mining uses your CPU resources. It may affect your device performance.' 
    },
  };

  const getText = (key: keyof typeof texts) => texts[key][language];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toString();
  };

  const progressToReward = ((100000 - stats.hashesUntilReward) / 100000) * 100;

  if (!isSupported) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive">{getText('notSupported')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-500/20 text-green-500 border-green-500/30">
            <Cpu className="w-4 h-4 mr-2" />
            {stats.isRunning ? getText('mining') : 'CPU Mining'}
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {getText('title')}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {getText('subtitle')}
          </p>
          <p className="text-sm text-primary mt-2 font-medium">
            {getText('rewardRate')}
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-6 overflow-hidden border-2 border-primary/20">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-20",
            stats.isRunning ? "from-green-500/30 to-emerald-500/30 animate-pulse" : "from-muted to-muted"
          )} />
          
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className={cn("w-6 h-6", stats.isRunning ? "text-green-500 animate-pulse" : "text-muted-foreground")} />
                {stats.isRunning ? getText('mining') : 'Ready'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-1" />
                {getText('settings')}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Hash Rate Display */}
            <div className="text-center py-6">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {formatNumber(stats.hashRate)}
              </div>
              <p className="text-muted-foreground">H/s ({getText('hashRate')})</p>
            </div>

            {/* Progress to Reward */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{getText('hashesUntilReward')}</span>
                <span className="font-medium text-primary">
                  {formatNumber(stats.hashesUntilReward)} hashes
                </span>
              </div>
              <Progress value={progressToReward} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {progressToReward.toFixed(1)}% → 0.01 DOGE
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Hash className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">{getText('sessionHashes')}</p>
                <p className="font-bold">{formatNumber(stats.sessionHashes)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">{getText('totalHashes')}</p>
                <p className="font-bold">{formatNumber(stats.totalHashes)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-xs text-muted-foreground">{getText('pendingHashes')}</p>
                <p className="font-bold">{formatNumber(stats.pendingHashes)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Coins className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">{getText('totalRewards')}</p>
                <p className="font-bold text-green-500">{stats.totalRewards.toFixed(4)} DOGE</p>
              </div>
            </div>

            {/* Settings */}
            {showSettings && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{getText('threads')}</span>
                    <span className="font-bold">{stats.threads}</span>
                  </div>
                  <Slider
                    value={[stats.threads]}
                    onValueChange={(v) => setThreads(v[0])}
                    min={1}
                    max={navigator.hardwareConcurrency || 8}
                    step={1}
                    disabled={stats.isRunning}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max: {navigator.hardwareConcurrency || 8} threads
                  </p>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{getText('warning')}</p>
                </div>
              </div>
            )}

            {/* Control Button */}
            <Button
              onClick={async () => {
                if (stats.isRunning) {
                  await stopMining();
                  await refreshBalance();
                } else {
                  startMining();
                }
              }}
              size="lg"
              className={cn(
                "w-full text-lg font-bold",
                stats.isRunning 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              )}
            >
              {stats.isRunning ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  {getText('stopMining')}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {getText('startMining')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WebMiningSection;

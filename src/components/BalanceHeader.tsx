import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogOut, User, Pickaxe, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dogeLogo from "@/assets/doge-logo.png";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import { formatDoge } from "@/data/dogeData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BalanceHeader = () => {
  const { miningBalance, depositBalance } = useDogeBalance();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await signOut();
    toast.success(t('header.logout'));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Christmas Banner */}
      <div className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white px-4 py-2 text-center text-sm font-medium animate-pulse">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          🎄✨ ¡Feliz Navidad y Próspero Año Nuevo! 🎅🎁 ¡Gracias por ser parte de RPG Doge! ❄️🌟
        </span>
      </div>
      
      {/* FaucetPay Issue Resolved Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white px-4 py-2 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          ✅ ¡Problema solucionado! Todos los depósitos han sido acreditados correctamente. Gracias por su paciencia. 💚
        </span>
      </div>
      <div className="glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={dogeLogo} alt="DOGE Logo" className="w-10 h-10 rounded-xl shadow-doge-sm" />
              <span className="text-xl font-bold">
                <span className="text-gradient">RPG</span> Doge
              </span>
            </div>

            {/* Balance & User */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Mining Balance display */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass shadow-doge-sm border border-emerald-500/30">
                      <Pickaxe className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-500 tabular-nums hidden sm:inline">
                        {formatDoge(miningBalance)}
                      </span>
                      <span className="text-sm font-bold text-emerald-500 tabular-nums sm:hidden">
                        {miningBalance.toFixed(4)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('header.miningBalance')}: {formatDoge(miningBalance)} DOGE</p>
                    <p className="text-xs text-muted-foreground">{t('header.miningBalanceDesc')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Deposit Balance display */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass shadow-doge-sm border border-primary/30">
                      <Wallet className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary tabular-nums hidden sm:inline">
                        {formatDoge(depositBalance)}
                      </span>
                      <span className="text-sm font-bold text-primary tabular-nums sm:hidden">
                        {depositBalance.toFixed(4)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('header.depositBalance')}: {formatDoge(depositBalance)} DOGE</p>
                    <p className="text-xs text-muted-foreground">{t('header.depositBalanceDesc')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BalanceHeader;

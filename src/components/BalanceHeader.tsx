import { useState, useEffect } from "react";
import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Pickaxe, Wallet, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dogeLogo from "@/assets/doge-logo.png";
import rpgDogeToken from "@/assets/rpgdoge-token.png";
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
  const [rdogeBalance, setRdogeBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRdogeBalance();
    }
  }, [user]);

  const fetchRdogeBalance = async () => {
    try {
      const { data, error } = await supabase.rpc('get_rdoge_balance');
      if (error) throw error;
      setRdogeBalance(Number(data) || 0);
    } catch (error) {
      console.error('Error fetching RDOGE balance:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t('header.logout'));
  };

  const formatRdoge = (amount: number) => {
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + "B";
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + "M";
    if (amount >= 1_000) return (amount / 1_000).toFixed(1) + "K";
    return amount.toLocaleString();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      
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

              {/* RPGDOGE Tokens Balance */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass shadow-doge-sm border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                      <img src={rpgDogeToken} alt="RDOGE" className="w-4 h-4" />
                      <span className="text-sm font-bold text-yellow-500 tabular-nums hidden sm:inline">
                        {formatRdoge(rdogeBalance)} RDOGE
                      </span>
                      <span className="text-sm font-bold text-yellow-500 tabular-nums sm:hidden">
                        {formatRdoge(rdogeBalance)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tokens RPGDOGE: {rdogeBalance.toLocaleString()} RDOGE</p>
                    <p className="text-xs text-muted-foreground">Tokens adquiridos en preventa</p>
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

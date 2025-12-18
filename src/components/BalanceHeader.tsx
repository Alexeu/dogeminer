import { useDogeBalance } from "@/contexts/DogeBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dog, Pickaxe, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dogeLogo from "@/assets/doge-logo.png";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import { formatDoge } from "@/data/dogeData";

const BalanceHeader = () => {
  const { balance, miningRate } = useDogeBalance();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("¡Hasta pronto! Much goodbye!");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
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
            
            {/* Mining rate indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary">
              <Pickaxe className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">+{formatDoge(miningRate)}/s</span>
            </div>

            {/* Balance display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass shadow-doge-sm">
              <Dog className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-gradient tabular-nums">
                {formatDoge(balance)}
              </span>
              <span className="text-sm text-muted-foreground hidden sm:inline">DOGE</span>
            </div>

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
    </header>
  );
};

export default BalanceHeader;

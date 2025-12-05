import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Pickaxe, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import bonkLogo from "@/assets/bonk-logo.png";

const BalanceHeader = () => {
  const { balance, miningRate } = useBonkBalance();
  const { user, signOut } = useAuth();

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("¡Hasta pronto!");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={bonkLogo} alt="BONK Logo" className="w-10 h-10 rounded-xl shadow-bonk-sm" />
            <span className="text-xl font-bold">
              <span className="text-gradient">BONK</span>Miner
            </span>
          </div>

          {/* Balance & User */}
          <div className="flex items-center gap-3">
            {/* Mining rate indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
              <Pickaxe className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">+{miningRate}/s</span>
            </div>

            {/* Balance display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass shadow-bonk-sm">
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-gradient tabular-nums">
                {formatNumber(Math.floor(balance))}
              </span>
              <span className="text-sm text-muted-foreground hidden sm:inline">BONK</span>
            </div>

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

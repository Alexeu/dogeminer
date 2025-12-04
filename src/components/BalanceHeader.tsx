import { useBonkBalance } from "@/contexts/BonkBalanceContext";
import { Coins, Pickaxe } from "lucide-react";

const BalanceHeader = () => {
  const { balance, miningRate } = useBonkBalance();

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-bonk-sm">
              <span className="text-xl">🐕</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-gradient">BONK</span>Miner
            </span>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-4">
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
              <span className="text-sm text-muted-foreground">BONK</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BalanceHeader;

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BonkCharacter, starterCharacter } from "@/data/bonkData";

export interface InventoryItem {
  character: BonkCharacter;
  quantity: number;
  miningStartTime: number | null; // timestamp when mining started, null if not mining
  accumulatedBonk: number; // accumulated BONK ready to claim
}

interface InventoryContextType {
  inventory: InventoryItem[];
  addToInventory: (character: BonkCharacter) => void;
  startMining: (characterId: string) => void;
  claimRewards: (characterId: string) => number;
  getTotalMiningRate: () => number;
  getClaimableAmount: (characterId: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const MINING_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const STARTER_GIFT_KEY = "bonk_starter_gift_received";

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const stored = localStorage.getItem("bonk_inventory");
    return stored ? JSON.parse(stored) : [];
  });

  // Give starter character (Bonknus) to new users
  useEffect(() => {
    const hasReceivedStarterGift = localStorage.getItem(STARTER_GIFT_KEY);
    if (!hasReceivedStarterGift) {
      setInventory((prev) => {
        const hasBonknus = prev.some((item) => item.character.id === "bonknus");
        if (!hasBonknus) {
          return [
            ...prev,
            {
              character: starterCharacter,
              quantity: 1,
              miningStartTime: null,
              accumulatedBonk: 0,
            },
          ];
        }
        return prev;
      });
      localStorage.setItem(STARTER_GIFT_KEY, "true");
    }
  }, []);

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    localStorage.setItem("bonk_inventory", JSON.stringify(inventory));
  }, [inventory]);

  // Update accumulated BONK every second
  useEffect(() => {
    const interval = setInterval(() => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.miningStartTime) {
            const elapsed = Date.now() - item.miningStartTime;
            if (elapsed >= MINING_DURATION) {
              // Mining complete - calculate final reward
              const earnedBonk = item.character.miningRate * item.quantity;
              return {
                ...item,
                accumulatedBonk: earnedBonk,
                miningStartTime: null, // Stop mining
              };
            }
          }
          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToInventory = (character: BonkCharacter) => {
    setInventory((prev) => {
      const existing = prev.find((item) => item.character.id === character.id);
      if (existing) {
        return prev.map((item) =>
          item.character.id === character.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          character,
          quantity: 1,
          miningStartTime: null,
          accumulatedBonk: 0,
        },
      ];
    });
  };

  const startMining = (characterId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.character.id === characterId
          ? { ...item, miningStartTime: Date.now(), accumulatedBonk: 0 }
          : item
      )
    );
  };

  const claimRewards = (characterId: string): number => {
    let claimedAmount = 0;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.character.id === characterId && item.accumulatedBonk > 0) {
          claimedAmount = item.accumulatedBonk;
          return { ...item, accumulatedBonk: 0 };
        }
        return item;
      })
    );
    return claimedAmount;
  };

  const getClaimableAmount = (characterId: string): number => {
    const item = inventory.find((i) => i.character.id === characterId);
    if (!item) return 0;
    
    if (item.accumulatedBonk > 0) {
      return item.accumulatedBonk;
    }
    
    if (item.miningStartTime) {
      const elapsed = Date.now() - item.miningStartTime;
      const progress = Math.min(elapsed / MINING_DURATION, 1);
      return Math.floor(item.character.miningRate * item.quantity * progress);
    }
    
    return 0;
  };

  const getTotalMiningRate = (): number => {
    return inventory.reduce((total, item) => {
      if (item.miningStartTime) {
        return total + item.character.miningRate * item.quantity;
      }
      return total;
    }, 0);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addToInventory,
        startMining,
        claimRewards,
        getTotalMiningRate,
        getClaimableAmount,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};

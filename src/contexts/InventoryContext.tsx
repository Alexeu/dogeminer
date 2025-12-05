import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { BonkCharacter, starterCharacter, characters } from "@/data/bonkData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface InventoryItem {
  character: BonkCharacter;
  quantity: number;
  miningStartTime: number | null;
  accumulatedBonk: number;
}

interface RpcResponse {
  success: boolean;
  error?: string;
  character_id?: string;
  expected_reward?: number;
  new_balance?: number;
  claimed_amount?: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  isLoading: boolean;
  addToInventory: (character: BonkCharacter) => Promise<boolean>;
  startMining: (characterId: string) => Promise<boolean>;
  claimRewards: (characterId: string) => Promise<number>;
  getTotalMiningRate: () => number;
  getClaimableAmount: (characterId: string) => number;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const MINING_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch inventory from database
  const refreshInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get user's characters
      const { data: userChars, error: charsError } = await supabase
        .from('user_characters')
        .select('*')
        .eq('user_id', user.id);

      if (charsError) throw charsError;

      // Get active mining sessions
      const { data: miningSessions, error: miningError } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('claimed_at', null);

      if (miningError) throw miningError;

      // Map to inventory items
      const items: InventoryItem[] = (userChars || []).map((uc) => {
        const miningSession = miningSessions?.find(
          (ms) => ms.user_character_id === uc.id
        );
        
        // Find character data from local data
        const charData = characters.find(c => c.id === uc.character_id) || 
          (uc.character_id === starterCharacter.id ? starterCharacter : null);
        
        if (!charData) {
          // Create character from database data
          return {
            character: {
              id: uc.character_id,
              name: uc.character_name,
              rarity: uc.character_rarity as BonkCharacter['rarity'],
              miningRate: Number(uc.mining_rate),
              image: '', // Will need to handle image mapping
            },
            quantity: uc.quantity,
            miningStartTime: miningSession ? new Date(miningSession.started_at).getTime() : null,
            accumulatedBonk: 0,
          };
        }

        return {
          character: charData,
          quantity: uc.quantity,
          miningStartTime: miningSession ? new Date(miningSession.started_at).getTime() : null,
          accumulatedBonk: 0,
        };
      });

      setInventory(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Claim starter gift when user first logs in
  useEffect(() => {
    const claimStarterGift = async () => {
      if (!user) return;

      try {
        const { data } = await supabase.rpc('claim_starter_gift', {
          p_character_id: starterCharacter.id,
          p_character_name: starterCharacter.name,
          p_mining_rate: starterCharacter.miningRate,
        });

        const result = data as unknown as RpcResponse;
        if (result?.success) {
          console.log('Starter gift claimed!');
          await refreshInventory();
        }
      } catch (error) {
        // Silently handle - gift may already be claimed
      }
    };

    if (user) {
      claimStarterGift();
    }
  }, [user, refreshInventory]);

  // Refresh inventory on user change
  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  // Update accumulated rewards every second (for UI only)
  useEffect(() => {
    const interval = setInterval(() => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.miningStartTime) {
            const elapsed = Date.now() - item.miningStartTime;
            if (elapsed >= MINING_DURATION) {
              const earnedBonk = item.character.miningRate * item.quantity;
              return {
                ...item,
                accumulatedBonk: earnedBonk,
              };
            } else {
              const progress = elapsed / MINING_DURATION;
              const earnedBonk = Math.floor(item.character.miningRate * item.quantity * progress);
              return {
                ...item,
                accumulatedBonk: earnedBonk,
              };
            }
          }
          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToInventory = async (character: BonkCharacter): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('add_user_character', {
        p_character_id: character.id,
        p_character_name: character.name,
        p_character_rarity: character.rarity,
        p_mining_rate: character.miningRate,
      });

      if (error) {
        console.error('Error adding character:', error);
        return false;
      }

      const result = data as unknown as RpcResponse;
      if (result?.success) {
        await refreshInventory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding character:', error);
      return false;
    }
  };

  const startMining = async (characterId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('start_mining', {
        p_character_id: characterId,
      });

      if (error) {
        console.error('Error starting mining:', error);
        return false;
      }

      const result = data as unknown as RpcResponse;
      if (result?.success) {
        // Update local state immediately
        setInventory((prev) =>
          prev.map((item) =>
            item.character.id === characterId
              ? { ...item, miningStartTime: Date.now(), accumulatedBonk: 0 }
              : item
          )
        );
        return true;
      }
      console.error('Start mining failed:', result?.error);
      return false;
    } catch (error) {
      console.error('Error starting mining:', error);
      return false;
    }
  };

  const claimRewards = async (characterId: string): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('claim_mining_reward', {
        p_amount: 0, // This is now ignored - server calculates actual amount
        p_character_id: characterId,
      });

      if (error) {
        console.error('Error claiming rewards:', error);
        return 0;
      }

      const result = data as unknown as RpcResponse;
      if (result?.success && result.claimed_amount) {
        const claimedAmount = result.claimed_amount;
        
        // Update local state
        setInventory((prev) =>
          prev.map((item) =>
            item.character.id === characterId
              ? { ...item, accumulatedBonk: 0, miningStartTime: null }
              : item
          )
        );
        
        return claimedAmount;
      }
      console.error('Claim failed:', result?.error);
      return 0;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return 0;
    }
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
        isLoading,
        addToInventory,
        startMining,
        claimRewards,
        getTotalMiningRate,
        getClaimableAmount,
        refreshInventory,
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

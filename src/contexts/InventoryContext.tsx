import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { DogeCharacter, starterCharacter, characters } from "@/data/dogeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface InventoryItem {
  character: DogeCharacter;
  quantity: number;
  level: number;
  miningStartTime: number | null;
  accumulatedDoge: number;
  miningExpiresAt: Date | null;
}

interface RpcResponse {
  success: boolean;
  error?: string;
  character_id?: string;
  expected_reward?: number;
  new_balance?: number;
  claimed_amount?: number;
  new_level?: number;
  new_mining_rate?: number;
  cost?: number;
  required?: number;
  current?: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  isLoading: boolean;
  addToInventory: (character: DogeCharacter) => Promise<boolean>;
  startMining: (characterId: string) => Promise<boolean>;
  claimRewards: (characterId: string) => Promise<{ amount: number; error?: string }>;
  levelUpCharacter: (characterId: string) => Promise<{ success: boolean; error?: string; newLevel?: number }>;
  renewCharacter: (characterId: string) => Promise<{ success: boolean; error?: string; cost?: number }>;
  getTotalMiningRate: () => number;
  getClaimableAmount: (characterId: string) => number;
  getLevelUpCost: (rarity: string) => number;
  getRenewalCost: (rarity: string) => number;
  isExpired: (item: InventoryItem) => boolean;
  getDaysRemaining: (item: InventoryItem) => number | null;
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
              rarity: uc.character_rarity as DogeCharacter['rarity'],
              miningRate: Number(uc.mining_rate),
              image: '',
            },
            quantity: uc.quantity,
            level: uc.level || 1,
            miningStartTime: miningSession ? new Date(miningSession.started_at).getTime() : null,
            accumulatedDoge: 0,
            miningExpiresAt: uc.mining_expires_at ? new Date(uc.mining_expires_at) : null,
          };
        }

        return {
          character: {
            ...charData,
            miningRate: Number(uc.mining_rate), // Use DB mining rate (includes level bonus)
          },
          quantity: uc.quantity,
          level: uc.level || 1,
          miningStartTime: miningSession ? new Date(miningSession.started_at).getTime() : null,
          accumulatedDoge: 0,
          miningExpiresAt: uc.mining_expires_at ? new Date(uc.mining_expires_at) : null,
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
              const earnedDoge = item.character.miningRate * item.quantity;
              return {
                ...item,
                accumulatedDoge: earnedDoge,
              };
            } else {
              const progress = elapsed / MINING_DURATION;
              // Use full precision instead of Math.floor to preserve small values
              const earnedDoge = item.character.miningRate * item.quantity * progress;
              return {
                ...item,
                accumulatedDoge: earnedDoge,
              };
            }
          }
          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToInventory = async (character: DogeCharacter): Promise<boolean> => {
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
              ? { ...item, miningStartTime: Date.now(), accumulatedDoge: 0 }
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

  const claimRewards = async (characterId: string): Promise<{ amount: number; error?: string }> => {
    if (!user) return { amount: 0, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('claim_mining_reward', {
        p_amount: 0, // This is now ignored - server calculates actual amount
        p_character_id: characterId,
      });

      if (error) {
        console.error('Error claiming rewards:', error);
        return { amount: 0, error: error.message };
      }

      const result = data as unknown as RpcResponse;
      
      if (result?.success) {
        const claimedAmount = result.claimed_amount || 0;
        
        // Update local state immediately
        setInventory((prev) =>
          prev.map((item) =>
            item.character.id === characterId
              ? { ...item, accumulatedDoge: 0, miningStartTime: null }
              : item
          )
        );
        
        // Refresh inventory from database to ensure sync
        await refreshInventory();
        
        return { amount: claimedAmount };
      }
      
      console.error('Claim failed:', result?.error || 'Unknown error');
      return { amount: 0, error: result?.error || 'Unknown error' };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return { amount: 0, error: 'Error al reclamar recompensas' };
    }
  };

  const getClaimableAmount = (characterId: string): number => {
    const item = inventory.find((i) => i.character.id === characterId);
    if (!item) return 0;
    
    if (item.accumulatedDoge > 0) {
      return item.accumulatedDoge;
    }
    
    if (item.miningStartTime) {
      const elapsed = Date.now() - item.miningStartTime;
      const progress = Math.min(elapsed / MINING_DURATION, 1);
      // Use full precision instead of Math.floor to preserve small values
      return item.character.miningRate * item.quantity * progress;
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

  const getLevelUpCost = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 2;
      case 'rare': return 3;
      case 'epic': return 4;
      case 'legendary': return 5;
      default: return 2; // starter
    }
  };

  const getRenewalCost = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 3;
      case 'epic': return 6;
      case 'legendary': return 9;
      case 'christmas': return 6;
      default: return 1; // starter
    }
  };

  const isExpired = (item: InventoryItem): boolean => {
    if (!item.miningExpiresAt) return false;
    return new Date() > item.miningExpiresAt;
  };

  const getDaysRemaining = (item: InventoryItem): number | null => {
    if (!item.miningExpiresAt) return null;
    const now = new Date();
    const diff = item.miningExpiresAt.getTime() - now.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renewCharacter = async (characterId: string): Promise<{ success: boolean; error?: string; cost?: number }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Find the character's UUID from inventory
    const { data: charData, error: charError } = await supabase
      .from('user_characters')
      .select('id')
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .maybeSingle();

    if (charError || !charData) {
      return { success: false, error: 'Character not found' };
    }

    try {
      const { data, error } = await supabase.rpc('renew_character_mining', {
        p_character_id: charData.id,
      });

      if (error) {
        console.error('Error renewing character:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as { success: boolean; error?: string; cost?: number };
      if (result?.success) {
        await refreshInventory();
        return { success: true, cost: result.cost };
      }
      return { success: false, error: result?.error || 'Unknown error' };
    } catch (error) {
      console.error('Error renewing character:', error);
      return { success: false, error: 'Error al renovar personaje' };
    }
  };

  const levelUpCharacter = async (characterId: string): Promise<{ success: boolean; error?: string; newLevel?: number }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('level_up_character', {
        p_character_id: characterId,
      });

      if (error) {
        console.error('Error leveling up:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as RpcResponse;
      if (result?.success) {
        await refreshInventory();
        return { success: true, newLevel: result.new_level };
      }
      return { success: false, error: result?.error || 'Unknown error' };
    } catch (error) {
      console.error('Error leveling up:', error);
      return { success: false, error: 'Error al subir de nivel' };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        isLoading,
        addToInventory,
        startMining,
        claimRewards,
        levelUpCharacter,
        renewCharacter,
        getTotalMiningRate,
        getClaimableAmount,
        getLevelUpCost,
        getRenewalCost,
        isExpired,
        getDaysRemaining,
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
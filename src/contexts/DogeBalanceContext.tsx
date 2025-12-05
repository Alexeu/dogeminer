import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface DogeBalanceContextType {
  balance: number;
  miningRate: number;
  referralCode: string;
  totalEarned: number;
  isLoading: boolean;
  addBalance: (amount: number) => Promise<boolean>;
  subtractBalance: (amount: number) => Promise<boolean>;
  claimMiningReward: (amount: number, characterId: string) => Promise<boolean>;
  applyReferralCode: (code: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const DogeBalanceContext = createContext<DogeBalanceContextType | undefined>(undefined);

export function DogeBalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Mining rate is calculated based on owned characters (set from InventoryContext)
  const miningRate = 0;

  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setReferralCode("");
      setTotalEarned(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_balance');
      
      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; balance?: number; referral_code?: string; total_earned?: number };
        if (result.success) {
          setBalance(result.balance || 0);
          setReferralCode(result.referral_code || "");
          setTotalEarned(result.total_earned || 0);
        }
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Subscribe to realtime balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as { balance?: number; referral_code?: string; total_earned?: number };
            setBalance(newData.balance || 0);
            setReferralCode(newData.referral_code || "");
            setTotalEarned(newData.total_earned || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBalance = async (amount: number): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('add_balance', { p_amount: amount });
      
      if (error) {
        console.error('Error adding balance:', error);
        toast.error("Error al añadir balance");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number };
        if (result.success) {
          setBalance(result.new_balance || 0);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error adding balance:', error);
      return false;
    }
  };

  const subtractBalance = async (amount: number): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('subtract_balance', { p_amount: amount });
      
      if (error) {
        console.error('Error subtracting balance:', error);
        toast.error("Error al restar balance");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number; error?: string };
        if (result.success) {
          setBalance(result.new_balance || 0);
          return true;
        } else if (result.error === 'Insufficient balance') {
          toast.error("Balance insuficiente");
        }
      }
      return false;
    } catch (error) {
      console.error('Error subtracting balance:', error);
      return false;
    }
  };

  const claimMiningReward = async (amount: number, characterId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('claim_mining_reward', { 
        p_amount: amount,
        p_character_id: characterId 
      });
      
      if (error) {
        console.error('Error claiming reward:', error);
        toast.error("Error al reclamar recompensa");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number };
        if (result.success) {
          setBalance(result.new_balance || 0);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return false;
    }
  };

  const applyReferralCode = async (code: string): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', { p_code: code });
      
      if (error) {
        console.error('Error applying referral code:', error);
        toast.error("Error al aplicar código de referido");
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; new_balance?: number; bonus?: number; error?: string };
        if (result.success) {
          setBalance(result.new_balance || 0);
          toast.success(`¡Código aplicado! Recibiste ${result.bonus?.toFixed(4)} DOGE de bonus`);
          return true;
        } else if (result.error) {
          toast.error(result.error);
        }
      }
      return false;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  };

  return (
    <DogeBalanceContext.Provider
      value={{
        balance,
        miningRate,
        referralCode,
        totalEarned,
        isLoading,
        addBalance,
        subtractBalance,
        claimMiningReward,
        applyReferralCode,
        refreshBalance,
      }}
    >
      {children}
    </DogeBalanceContext.Provider>
  );
}

export function useDogeBalance() {
  const context = useContext(DogeBalanceContext);
  if (context === undefined) {
    throw new Error("useDogeBalance must be used within a DogeBalanceProvider");
  }
  return context;
}

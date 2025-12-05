import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface BalanceResponse {
  success: boolean;
  balance?: number;
  referral_code?: string;
  total_earned?: number;
  new_balance?: number;
  error?: string;
}

interface BonkBalanceContextType {
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

const BonkBalanceContext = createContext<BonkBalanceContextType | undefined>(undefined);

const BASE_MINING_RATE = 5;

export const BonkBalanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [miningRate] = useState(BASE_MINING_RATE);

  // Fetch balance from database
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

      const response = data as unknown as BalanceResponse;
      if (response?.success) {
        setBalance(Number(response.balance) || 0);
        setReferralCode(response.referral_code || "");
        setTotalEarned(Number(response.total_earned) || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load balance on mount and when user changes
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Subscribe to realtime balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as { balance?: number; total_earned?: number };
            setBalance(Number(newData.balance) || 0);
            setTotalEarned(Number(newData.total_earned) || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBalance = useCallback(async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('add_balance', { p_amount: amount });
      
      if (error) {
        console.error('Error adding balance:', error);
        return false;
      }

      const response = data as unknown as BalanceResponse;
      if (response?.success) {
        setBalance(Number(response.new_balance) || 0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding balance:', error);
      return false;
    }
  }, [user]);

  const subtractBalance = useCallback(async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('subtract_balance', { p_amount: amount });
      
      if (error) {
        console.error('Error subtracting balance:', error);
        return false;
      }

      const response = data as unknown as BalanceResponse;
      if (response?.success) {
        setBalance(Number(response.new_balance) || 0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error subtracting balance:', error);
      return false;
    }
  }, [user]);

  const claimMiningReward = useCallback(async (amount: number, characterId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('claim_mining_reward', { 
        p_amount: amount, 
        p_character_id: characterId 
      });
      
      if (error) {
        console.error('Error claiming mining reward:', error);
        return false;
      }

      const response = data as unknown as BalanceResponse;
      if (response?.success) {
        setBalance(Number(response.new_balance) || 0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error claiming mining reward:', error);
      return false;
    }
  }, [user]);

  const applyReferralCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', { p_code: code });
      
      if (error) {
        console.error('Error applying referral code:', error);
        return false;
      }

      const response = data as unknown as BalanceResponse;
      if (response?.success) {
        setBalance(Number(response.new_balance) || 0);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  }, [user]);

  return (
    <BonkBalanceContext.Provider
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
    </BonkBalanceContext.Provider>
  );
};

export const useBonkBalance = () => {
  const context = useContext(BonkBalanceContext);
  if (!context) {
    throw new Error("useBonkBalance must be used within a BonkBalanceProvider");
  }
  return context;
};

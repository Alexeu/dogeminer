import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BonkBalanceContextType {
  balance: number;
  miningRate: number;
  referralCode: string;
  referralEarnings: number;
  referralCount: number;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  setMiningRate: (rate: number) => void;
  applyReferralCode: (code: string) => boolean;
}

const BonkBalanceContext = createContext<BonkBalanceContextType | undefined>(undefined);

const INITIAL_BALANCE = 10000;
const BASE_MINING_RATE = 5;
const REFERRAL_PERCENTAGE = 0.05; // 5%

// Generate a unique referral code
const generateReferralCode = () => {
  const stored = localStorage.getItem("bonk_referral_code");
  if (stored) return stored;
  const code = "BONK" + Math.random().toString(36).substring(2, 6).toUpperCase();
  localStorage.setItem("bonk_referral_code", code);
  return code;
};

// Simple referral storage (simulated - in production use a database)
const getReferrals = (): Record<string, string[]> => {
  const stored = localStorage.getItem("bonk_referrals");
  return stored ? JSON.parse(stored) : {};
};

const addReferral = (referrerCode: string, refereeCode: string) => {
  const referrals = getReferrals();
  if (!referrals[referrerCode]) {
    referrals[referrerCode] = [];
  }
  if (!referrals[referrerCode].includes(refereeCode)) {
    referrals[referrerCode].push(refereeCode);
  }
  localStorage.setItem("bonk_referrals", JSON.stringify(referrals));
};

export const BonkBalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [miningRate, setMiningRate] = useState(BASE_MINING_RATE);
  const [referralCode] = useState(generateReferralCode);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);

  // Load referrer code on mount
  useEffect(() => {
    const storedReferrer = localStorage.getItem("bonk_referrer");
    if (storedReferrer) {
      setReferrerCode(storedReferrer);
    }
    // Count referrals
    const referrals = getReferrals();
    setReferralCount(referrals[referralCode]?.length || 0);
  }, [referralCode]);

  // Passive mining effect with referral bonus
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => prev + miningRate);
      
      // If user has a referrer, add 5% to that referrer's earnings
      if (referrerCode) {
        // Simulate referrer earning (in production, this would be server-side)
        const referrerEarnings = JSON.parse(localStorage.getItem("bonk_referrer_earnings") || "{}");
        referrerEarnings[referrerCode] = (referrerEarnings[referrerCode] || 0) + (miningRate * REFERRAL_PERCENTAGE);
        localStorage.setItem("bonk_referrer_earnings", JSON.stringify(referrerEarnings));
      }

      // Check if we have referral earnings
      const allEarnings = JSON.parse(localStorage.getItem("bonk_referrer_earnings") || "{}");
      const myEarnings = allEarnings[referralCode] || 0;
      if (myEarnings > 0) {
        setReferralEarnings(myEarnings);
        // Add referral earnings to balance
        setBalance((prev) => prev + (myEarnings * REFERRAL_PERCENTAGE));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [miningRate, referrerCode, referralCode]);

  const addBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  const subtractBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const applyReferralCode = (code: string): boolean => {
    // Check if code exists (simulate validation)
    if (code.startsWith("BONK") && code.length === 8) {
      localStorage.setItem("bonk_referrer", code);
      localStorage.setItem("bonk_applied_referral", "true");
      setReferrerCode(code);
      addReferral(code, referralCode);
      // Welcome bonus
      setBalance((prev) => prev + 500);
      return true;
    }
    return false;
  };

  return (
    <BonkBalanceContext.Provider
      value={{
        balance,
        miningRate,
        referralCode,
        referralEarnings,
        referralCount,
        addBalance,
        subtractBalance,
        setMiningRate,
        applyReferralCode,
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

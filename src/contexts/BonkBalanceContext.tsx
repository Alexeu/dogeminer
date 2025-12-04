import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BonkBalanceContextType {
  balance: number;
  miningRate: number;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  setMiningRate: (rate: number) => void;
}

const BonkBalanceContext = createContext<BonkBalanceContextType | undefined>(undefined);

const INITIAL_BALANCE = 10000;
const BASE_MINING_RATE = 5; // BONK per second

export const BonkBalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [miningRate, setMiningRate] = useState(BASE_MINING_RATE);

  // Passive mining effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => prev + miningRate);
    }, 1000);

    return () => clearInterval(interval);
  }, [miningRate]);

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

  return (
    <BonkBalanceContext.Provider
      value={{ balance, miningRate, addBalance, subtractBalance, setMiningRate }}
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

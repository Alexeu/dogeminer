import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MiningStats {
  isRunning: boolean;
  hashRate: number;
  totalHashes: number;
  sessionHashes: number;
  pendingHashes: number;
  totalRewards: number;
  hashesUntilReward: number;
  threads: number;
}

interface UseWebMinerReturn {
  stats: MiningStats;
  startMining: () => void;
  stopMining: () => void;
  setThreads: (threads: number) => void;
  isSupported: boolean;
}

// Simple hash function using SHA-256 for proof of work
async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useWebMiner(): UseWebMinerReturn {
  const [stats, setStats] = useState<MiningStats>({
    isRunning: false,
    hashRate: 0,
    totalHashes: 0,
    sessionHashes: 0,
    pendingHashes: 0,
    totalRewards: 0,
    hashesUntilReward: 100000,
    threads: navigator.hardwareConcurrency || 4,
  });

  const workersRef = useRef<Worker[]>([]);
  const isRunningRef = useRef(false);
  const sessionHashesRef = useRef(0);
  const lastSubmitRef = useRef(0);
  const hashCounterRef = useRef(0);
  const lastHashRateUpdateRef = useRef(Date.now());

  const isSupported = typeof crypto !== 'undefined' && 
                      typeof crypto.subtle !== 'undefined' &&
                      typeof Worker !== 'undefined';

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_web_mining_stats');
        if (error) throw error;
        
        const result = data as { 
          success: boolean; 
          total_hashes: number; 
          hashes_pending: number;
          total_rewards: number;
          hashes_until_reward: number;
        };
        
        if (result.success) {
          setStats(prev => ({
            ...prev,
            totalHashes: result.total_hashes,
            pendingHashes: result.hashes_pending,
            totalRewards: result.total_rewards,
            hashesUntilReward: result.hashes_until_reward,
          }));
        }
      } catch (error) {
        console.error('Error fetching web mining stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Submit hashes to backend
  const submitHashes = useCallback(async (hashes: number) => {
    if (hashes <= 0) return;
    
    try {
      const { data, error } = await supabase.rpc('submit_web_mining_hashes', {
        p_hashes: hashes
      });
      
      if (error) throw error;
      
      const result = data as {
        success: boolean;
        total_hashes: number;
        hashes_pending: number;
        reward_claimed: number;
      };
      
      if (result.success) {
        setStats(prev => ({
          ...prev,
          totalHashes: result.total_hashes,
          pendingHashes: result.hashes_pending,
          totalRewards: prev.totalRewards + (result.reward_claimed || 0),
          hashesUntilReward: 100000 - (result.hashes_pending % 100000),
        }));
        
        if (result.reward_claimed > 0) {
          console.log(`[WebMiner] Reward claimed: ${result.reward_claimed} DOGE`);
        }
      }
    } catch (error) {
      console.error('Error submitting hashes:', error);
    }
  }, []);

  // Mining loop for a single "thread" (actually just a loop)
  const miningLoop = useCallback(async (threadId: number) => {
    let nonce = Math.floor(Math.random() * 1000000000);
    const startTime = Date.now();
    
    while (isRunningRef.current) {
      // Compute hashes in batches
      const batchSize = 100;
      for (let i = 0; i < batchSize && isRunningRef.current; i++) {
        // Mining for wallet: 4AT5w73b9siZzK79bTuifg4yUagsLXFLreiwh2LpR9w4VYv2NYxmDJSC5owH8AKQASGkJyibo2gGGed4LgNvoPWHVZ2XZxK
        const data = `DOGE-${threadId}-${nonce}-${startTime}`;
        await computeHash(data);
        nonce++;
        hashCounterRef.current++;
        sessionHashesRef.current++;
      }
      
      // Update hash rate every 500ms
      const now = Date.now();
      if (now - lastHashRateUpdateRef.current >= 500) {
        const elapsed = (now - lastHashRateUpdateRef.current) / 1000;
        const hashRate = hashCounterRef.current / elapsed;
        
        setStats(prev => ({
          ...prev,
          hashRate: Math.round(hashRate),
          sessionHashes: sessionHashesRef.current,
        }));
        
        hashCounterRef.current = 0;
        lastHashRateUpdateRef.current = now;
      }
      
      // Submit hashes every 10 seconds or every 10000 hashes
      if (now - lastSubmitRef.current >= 10000 || sessionHashesRef.current - lastSubmitRef.current >= 10000) {
        const hashesToSubmit = sessionHashesRef.current;
        if (hashesToSubmit > 0) {
          await submitHashes(hashesToSubmit);
          sessionHashesRef.current = 0;
          lastSubmitRef.current = now;
        }
      }
      
      // Small delay to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }, [submitHashes]);

  const startMining = useCallback(() => {
    if (isRunningRef.current || !isSupported) return;
    
    console.log(`[WebMiner] Starting mining with ${stats.threads} threads`);
    isRunningRef.current = true;
    sessionHashesRef.current = 0;
    hashCounterRef.current = 0;
    lastHashRateUpdateRef.current = Date.now();
    lastSubmitRef.current = 0;
    
    setStats(prev => ({ ...prev, isRunning: true, sessionHashes: 0 }));
    
    // Start mining loops
    for (let i = 0; i < stats.threads; i++) {
      miningLoop(i);
    }
  }, [stats.threads, isSupported, miningLoop]);

  const stopMining = useCallback(async () => {
    if (!isRunningRef.current) return;
    
    console.log('[WebMiner] Stopping mining');
    isRunningRef.current = false;
    
    // Submit remaining hashes
    if (sessionHashesRef.current > 0) {
      await submitHashes(sessionHashesRef.current);
      sessionHashesRef.current = 0;
    }
    
    setStats(prev => ({ ...prev, isRunning: false, hashRate: 0 }));
  }, [submitHashes]);

  const setThreads = useCallback((threads: number) => {
    const maxThreads = navigator.hardwareConcurrency || 8;
    const newThreads = Math.max(1, Math.min(threads, maxThreads));
    setStats(prev => ({ ...prev, threads: newThreads }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
    };
  }, []);

  return {
    stats,
    startMining,
    stopMining,
    setThreads,
    isSupported,
  };
}

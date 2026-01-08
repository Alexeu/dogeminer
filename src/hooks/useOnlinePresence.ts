import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnlinePresence = () => {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [presenceId, setPresenceId] = useState<string | null>(null);

  const updatePresence = useCallback(async () => {
    try {
      if (presenceId) {
        // Update existing presence
        await supabase
          .from('online_presence')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', presenceId);
      } else {
        // Create new presence
        const { data } = await supabase
          .from('online_presence')
          .insert({ fingerprint: crypto.randomUUID() })
          .select('id')
          .single();
        
        if (data) {
          setPresenceId(data.id);
        }
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [presenceId]);

  const fetchOnlineCount = useCallback(async () => {
    try {
      // Clean old records first
      await supabase.rpc('cleanup_old_presence');
      
      // Get count of active users (last 2 minutes)
      const { count } = await supabase
        .from('online_presence')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString());
      
      setOnlineCount(count || 0);
    } catch (error) {
      console.error('Error fetching online count:', error);
    }
  }, []);

  useEffect(() => {
    // Initial presence and count
    updatePresence();
    fetchOnlineCount();

    // Update presence every 30 seconds
    const presenceInterval = setInterval(updatePresence, 30000);
    
    // Fetch count every 10 seconds
    const countInterval = setInterval(fetchOnlineCount, 10000);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('online_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_presence',
        },
        () => {
          fetchOnlineCount();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      clearInterval(presenceInterval);
      clearInterval(countInterval);
      channel.unsubscribe();
      
      // Remove presence when leaving
      if (presenceId) {
        supabase.from('online_presence').delete().eq('id', presenceId);
      }
    };
  }, [updatePresence, fetchOnlineCount, presenceId]);

  return { onlineCount };
};

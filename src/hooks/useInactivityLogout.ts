import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useInactivityLogout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const handleLogout = useCallback(async () => {
    if (isAdmin) return; // Don't logout admins
    
    toast({
      title: "Sesión cerrada",
      description: "Tu sesión ha sido cerrada por inactividad",
      variant: "destructive",
    });
    
    await signOut();
    navigate('/auth');
  }, [isAdmin, signOut, navigate, toast]);

  const resetTimer = useCallback(() => {
    if (isAdmin || !user) return; // Don't set timer for admins or logged out users

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  }, [isAdmin, user, handleLogout]);

  useEffect(() => {
    if (!user || isAdmin) {
      // Clear any existing timer if no user or is admin
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Activity events to listen for
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, isAdmin, resetTimer]);

  return { isAdmin };
}

import { useEffect } from 'react';
import { getClientSupabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export function useRealtimeNotifications(userId?: string) {
  const supabase = getClientSupabase();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `user_id=eq.${userId}` }, (payload) => {
        toast.success(`Project "${payload.new.name}" was updated!`, {
          icon: '🚀',
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${userId}` }, (payload) => {
        toast(`Support Ticket updated: ${payload.new.status}`, {
          icon: '🎫',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'invoices', filter: `user_id=eq.${userId}` }, (payload) => {
        toast.success(`New Invoice created for $${payload.new.amount}`, {
          icon: '🧾',
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
}

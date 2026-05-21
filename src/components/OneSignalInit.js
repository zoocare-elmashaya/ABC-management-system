'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { createClient } from '@/utils/supabase/client';

export default function OneSignalInit() {
  useEffect(() => {
    const initNotifications = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) return;

      // Initialize OneSignal
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      // Prompt user to opt-in
      await OneSignal.Notifications.requestPermission();

      // Crucial: Tie the browser subscription to the logged-in Supabase user ID
      await OneSignal.login(session.user.id);
    };

    initNotifications().catch(console.error);
  }, []);

  return null;
}
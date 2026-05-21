'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { createClient } from '@supabase/supabase-js';

// Initialize a lightweight Supabase instance for auth tracking
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OneSignalProvider({ children }) {
  useEffect(() => {
    // 1. Initialize the OneSignal Web Browser SDK
    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true, // Allows testing on http://localhost
      notifyButton: {
        enable: true, // Automatically adds a clean subscription bell in the corner
      },
    }).then(() => {
      console.log('OneSignal initialized successfully.');
    });

    // 2. Listen to Supabase Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Essential step: Links the Supabase UUID string directly to OneSignal's database
        console.log('Linking user to OneSignal:', session.user.id);
        OneSignal.login(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Disconnect the device token when logging out
        console.log('User signed out, unlinking OneSignal.');
        OneSignal.logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
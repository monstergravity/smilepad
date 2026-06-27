import { createClient } from '@supabase/supabase-js';

export type WaitlistSignup = {
  email: string;
  source: 'homepage';
  locale: 'en-US';
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabasePublishableKey) &&
  !String(supabaseUrl).includes('your-project-ref') &&
  !String(supabasePublishableKey).includes('your_key');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://abjspnuohxouufkdjefs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFianNwbnVvaHhvdXVma2RqZWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMDA5NzcsImV4cCI6MjEwNDg3Njk3N30.hVL3TRPwA1xalf1Tb2LiKJ58Q_DgBc5RWwFs2AfR890';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
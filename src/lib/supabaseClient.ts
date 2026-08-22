import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://coxfhqnjsbifamgpdzqa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveGZocW5qc2JpZmFtZ3BkenFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Nzk1NTEsImV4cCI6MjEwMjQ1NTU1MX0.4fdjs-waeN576f8rnyHICUmawezZwvI2YYuPulZKTb4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

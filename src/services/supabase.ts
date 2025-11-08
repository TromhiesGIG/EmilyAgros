import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nstrcagacssakwwouryh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdHJjYWdhY3NzYWt3d291cnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzcxNzUsImV4cCI6MjA3NDgxMzE3NX0.EvV9cLA41r7zLwa2wscablak3vz4oTCbpf82WjftqkQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
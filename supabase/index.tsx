import { createClient } from "@supabase/supabase-js";


const supabase = createClient('https://tqpjskgcqrbxrcuivkmx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcGpza2djcXJieHJjdWl2a214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDU4MTgsImV4cCI6MjA1ODU4MTgxOH0.JSSiu1Zz3hy7-6-VtoF4EelZ80iNmIq4RUjWggwJKLQ');

export default supabase;
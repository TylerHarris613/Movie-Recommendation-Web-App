import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aifwqxoamnnmezjxgzep.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZndxeG9hbW5ubWV6anhnemVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODczMjI0NjEsImV4cCI6MjAwMjg5ODQ2MX0.NiYc2ATDaYVvOOPcThmCp0TgnDNyPwroko2KQ143q2A";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

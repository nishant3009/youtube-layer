import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.supabase_url,
  process.env.supabase_anon_key
);

export default supabase;

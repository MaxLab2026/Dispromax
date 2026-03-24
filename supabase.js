// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Credenciales de tu proyecto
const supabaseUrl = "https://cosxgumrxgihkeszvgwu.supabase.co"
const supabaseKey = "sb_publishable_B58gh4o9vrHK58hNramtGw_yRck0jwX"

export const supabase = createClient(supabaseUrl, supabaseKey)

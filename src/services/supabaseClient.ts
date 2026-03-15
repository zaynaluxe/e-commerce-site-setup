import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hrwhodygibbbvostfvny.supabase.co"
const supabaseKey = "sb_publishable_lfTe2MdhPYFxftedzmswHw_7OmUHkrG"

export const supabase = createClient(supabaseUrl, supabaseKey)
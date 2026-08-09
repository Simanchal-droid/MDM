const SUPABASE_URL = "https://qrjstcvchewhpsgfuqjp.supabase.co";

const SUPABASE_KEY = "sb_publishable_euspKaTToGGqVaCdCn9Wxw_m_4AG4eT";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
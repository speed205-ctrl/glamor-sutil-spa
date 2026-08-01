/**
 * Glamor Sutil - Supabase client configuration
 * Load this script after the Supabase CDN script in HTML:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

// Paste your Supabase credentials here to hardcode them.
// If left blank, you can enter them in the Admin Panel UI, and they will be saved in localStorage.
const SUPABASE_URL = ""; 
const SUPABASE_ANON_KEY = ""; 

let _supabaseClientInstance = null;

function getSupabaseClient() {
  if (_supabaseClientInstance) {
    return _supabaseClientInstance;
  }

  // Fallback to localStorage if constants are empty
  const url = SUPABASE_URL || localStorage.getItem('glamor_supabase_url');
  const key = SUPABASE_ANON_KEY || localStorage.getItem('glamor_supabase_anon_key');

  if (!url || !key) {
    return null;
  }

  if (typeof supabase === 'undefined') {
    console.error("Supabase SDK is not loaded. Ensure the CDN script is included.");
    return null;
  }

  try {
    _supabaseClientInstance = supabase.createClient(url, key);
    return _supabaseClientInstance;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

// Export to window scope
window.getSupabaseClient = getSupabaseClient;
window.isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY) || !!(localStorage.getItem('glamor_supabase_url') && localStorage.getItem('glamor_supabase_anon_key'));
};

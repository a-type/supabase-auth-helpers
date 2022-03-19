let supabaseUrl: string;
let supabaseAnonKey: string;

export function setConfig(url: string, anonKey: string) {
  supabaseUrl = url;
  supabaseAnonKey = anonKey;
}

export function getConfig() {
  return { supabaseUrl, supabaseAnonKey };
}

export { SupabaseClient } from './utils/initSupabase';
import { getClientWithEnvCheck } from './utils/initSupabase';

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

export const skHelper = (url?: string, anonKey?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    supabaseUrl = url;
    supabaseAnonKey = anonKey;
  }

  return {
    apiInfo: { supabaseUrl, supabaseAnonKey },
    supabaseClient: getClientWithEnvCheck(supabaseUrl, supabaseAnonKey)
  };
};

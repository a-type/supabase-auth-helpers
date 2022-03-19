// import { supabaseClient, SupabaseClient } from './initSupabase';
import { skHelper, SupabaseClient } from '../instance';
import { CookieOptions } from '../../nextjs/types';

/**
 * This is a helper method to wrap your SupabaseClient to inject a user's access_token to make use of RLS on the server side.
 *
 * ```js
 * import { supabaseServerClient } from '@supabase/supabase-auth-helpers/nextjs';
 *
 * export async function getServerSideProps(context) {
 *   // Run queries with RLS on the server
 *   const { data } = await supabaseServerClient(context)
 *     .from('test')
 *     .select('*');
 *   return {
 *     props: { data }, // will be passed to the page component as props
 *   }
 * }
 * ```
 *
 * @param supabaseClient
 * @param context
 * @param cookieOptions
 * @returns supabaseClient
 *
 * @category Server
 */

export default function supabaseServerClient(
  req: Request,
  cookieOptions: CookieOptions = {
    name: 'sb'
  }
): SupabaseClient {
  const { supabaseClient } = skHelper();
  const access_token = req.headers.get(`${cookieOptions.name}-access-token`);
  if (access_token) {
    supabaseClient.auth.setAuth(access_token);
  }
  return supabaseClient;
}
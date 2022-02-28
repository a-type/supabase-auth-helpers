import { User, createClient } from '@supabase/supabase-js';
import { CookieOptions } from '../../nextjs/types';
import { setCookies } from '../../shared/utils/cookies';
import { COOKIE_OPTIONS } from '../../nextjs/utils/constants';
import { jwtDecoder } from '../../shared/utils/jwt';
import {
  SvelteKitRequestAdapter,
  SvelteKitResponseAdapter
} from '../../shared/adapters/SvelteKitAdapter';

interface RequestResponse {
  req: Request;
  res: Response;
}

export default async function getUser(
  { req, res }: RequestResponse,
  cookieOptions: CookieOptions = COOKIE_OPTIONS
): Promise<{ user: User | null; accessToken: string | null }> {
  try {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error(
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables are required!'
      );
    }
    if (!req.headers.get('cookies')) {
      throw new Error('Not able to parse cookies!');
    }
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    const access_token = req.headers.get(`${cookieOptions.name}-access-token`);
    const refresh_token = req.headers.get(
      `${cookieOptions.name}-refresh-token`
    );

    if (!access_token) {
      throw new Error('No cookie found!');
    }
    // Get payload from access token.
    const jwtUser = jwtDecoder(access_token);
    if (!jwtUser?.exp) {
      throw new Error('Not able to parse JWT payload!');
    }
    const timeNow = Math.round(Date.now() / 1000);
    if (jwtUser.exp < timeNow) {
      // JWT is expired, let's refresh from Gotrue
      if (!refresh_token) throw new Error('No refresh_token cookie found!');
      const { data, error } = await supabase.auth.api.refreshAccessToken(
        refresh_token
      );
      if (error) {
        throw error;
      } else {
        setCookies(
          new SvelteKitRequestAdapter(req),
          new SvelteKitResponseAdapter(res),
          [
            { key: 'access-token', value: data!.access_token },
            { key: 'refresh-token', value: data!.refresh_token! }
          ].map((token) => ({
            name: `${cookieOptions.name}-${token.key}`,
            value: token.value,
            domain: cookieOptions.domain,
            maxAge: cookieOptions.lifetime ?? 0,
            path: cookieOptions.path,
            sameSite: cookieOptions.sameSite
          }))
        );
        return { user: data!.user!, accessToken: data!.access_token };
      }
    } else {
      const { user, error: getUserError } = await supabase.auth.api.getUser(
        access_token
      );
      if (getUserError) {
        throw getUserError;
      }
      return { user: user!, accessToken: access_token };
    }
  } catch (e) {
    console.log('Error getting user:', e);
    return { user: null, accessToken: null };
  }
}
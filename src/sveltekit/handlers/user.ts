import type { Handle } from '@sveltejs/kit';
import { ApiError, CookieOptions } from '../../nextjs/types';
import { COOKIE_OPTIONS } from '../../nextjs/utils/constants';
import { jwtDecoder } from '../../shared/utils/jwt';
import { json } from '../utils/json';
// import getUser from '../utils/getUser';

export default async function handleUser(
  cookieOptions: CookieOptions = COOKIE_OPTIONS
) {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    try {
      if (!req.headers.get('cookies')) {
        throw new Error('Not able to parse cookies!');
      }
      const cookies = req.headers.get('cookies');
      const access_token = cookies?[`${cookieOptions.name}-access-token`];

      if (!access_token) {
        throw new Error('No cookie found!');
      }

      // Get payload from cached access token.
      const jwtUser = jwtDecoder(access_token);
      if (!jwtUser?.exp) {
        throw new Error('Not able to parse JWT payload!');
      }
      const timeNow = Math.round(Date.now() / 1000);
      if (jwtUser.exp < timeNow) {
        // JWT is expired, let's refresh from Gotrue
        // const response = await getUser({ req, res }, cookieOptions);
        // res.status(200).json(response);
      } else {
        // Transform JWT and add note that it ise cached from JWT.
        const user = {
          id: jwtUser.sub,
          aud: null,
          role: null,
          email: null,
          email_confirmed_at: null,
          phone: null,
          confirmed_at: null,
          last_sign_in_at: null,
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: null,
          updated_at: null,
          'supabase-auth-helpers-note':
            'This user payload is retrieved from the cached JWT and might be stale. If you need up to date user data, please call the `getUser` method in a server-side context!'
        };
        const mergedUser = { ...user, ...jwtUser };
        return json({ user: mergedUser, accessToken: access_token })
      }
    } catch (e) {
      const error = e as ApiError;
      return json(
        { user: null, accessToken: null, error: error.message },
        {
          headers,
          status: 400
        }
      )
    }
  };
  return handle;
}

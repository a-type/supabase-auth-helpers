import type { Handle } from '@sveltejs/kit';
import { CookieOptions } from '../../nextjs/types';
import { setCookies } from '../../shared/utils/cookies';
import { toExpressRequest, toExpressResponse } from '../utils/expressify';

export const handleCallback = (cookieOptions: CookieOptions) => {
  const handle: Handle = async ({ event, resolve }) => {
    const req = event.request;
    let res = await resolve(event);

    if (req.method !== 'POST') {
      const headers = new Headers({
        Allow: 'POST'
      });
      return new Response(null, { headers, status: 405 });
    }

    const { event: bodyEvent, session } = await req.json();

    if (!bodyEvent) throw new Error('Auth event missing!');
    if (bodyEvent === 'SIGNED_IN') {
      if (!session) throw new Error('Auth session missing!');
      setCookies(
        toExpressRequest(req),
        toExpressResponse(res),
        [
          { key: 'access-token', value: session.access_token },
          { key: 'refresh-token', value: session.refresh_token }
        ].map((token) => ({
          name: `${cookieOptions.name}-${token.key}`,
          value: token.value,
          domain: cookieOptions.domain,
          maxAge: cookieOptions.lifetime ?? 0,
          path: cookieOptions.path,
          sameSite: cookieOptions.sameSite
        }))
      );
    }

    if (bodyEvent === 'SIGNED_OUT') {
      setCookies(
        toExpressRequest(req),
        toExpressResponse(res),
        ['access-token', 'refresh-token'].map((key) => ({
          name: `${cookieOptions.name}-${key}`,
          value: '',
          maxAge: -1
        }))
      );
    }

    return res;
  };

  return handle;
};

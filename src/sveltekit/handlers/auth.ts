import type { Handle } from '@sveltejs/kit';
import { CookieOptions } from '../../nextjs/types';
import { COOKIE_OPTIONS } from '../../nextjs/utils/constants';
import { handleCallback } from './callback';
import handleUser from './user';

export default function handleAuth(
  cookieOptions: CookieOptions = COOKIE_OPTIONS
) {
  const handle: Handle = async ({ event, resolve }) => {
    let {
      url: { pathname: route }
    } = event;

    switch (route) {
      case '/api/auth/callback':
        const handleCb = await handleCallback(cookieOptions);
        return handleCb({ event, resolve });
      case '/api/auth/user':
        const handleUsr = await handleUser(cookieOptions);
        return handleUsr({ event, resolve });
      default:
        const response = await resolve(event);
        return response;
    }
  };
  return handle;
}

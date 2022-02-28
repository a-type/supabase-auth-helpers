import type { Handle } from '@sveltejs/kit';
import { CookieOptions } from '../../nextjs/types';
import { COOKIE_OPTIONS } from '../../nextjs/utils/constants';
import { json } from '../utils/json';
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
      case '/api/callback.json':
        const handleCb = await handleCallback(cookieOptions);
        return handleCb({ event, resolve });
      case '/api/user.json':
        const handleUsr = await handleUser(cookieOptions);
        return handleUsr({ event, resolve });
      default:
        return json({}, { status: 404 });
    }
  };
  return handle;
}

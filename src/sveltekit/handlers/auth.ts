import type { Handle } from '@sveltejs/kit';
import { CookieOptions } from '../../nextjs/types';
import { COOKIE_OPTIONS } from '../../nextjs/utils/constants';
import { handleCallback } from './callback';

export default function handleAuth(
  cookieOptions: CookieOptions = COOKIE_OPTIONS
) {
  const handle: Handle = async ({ event, resolve }) => {
    let {
      url: { pathname: route }
    } = event;

    const handleCb = await handleCallback(cookieOptions);

    switch (route) {
      case '/api/callback.json':
        return handleCb({ event, resolve });
      case '/api/user.json':
      //
    }
  };
  return handle;
}

/**
 * Inspired by Remix helper method
 * @see https://remix.run/docs/en/v1/api/remix#json
 */
const initValues: ResponseInit = {
  headers: {},
  status: 200
};

export function json<Data>(
  data: Data,
  init: ResponseInit = initValues
): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

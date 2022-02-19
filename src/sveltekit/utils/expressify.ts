export const toExpressRequest = async (req: Request) => ({
  headers: { host: req.headers.get('host') }
});

export const toExpressResponse = (res: Response) => ({
  ...res,
  getHeader: (header: string) => res.headers.get(header.toLowerCase()),
  setHeader: (header: string, value: any) =>
    res.headers.set(header.toLowerCase(), value)
});

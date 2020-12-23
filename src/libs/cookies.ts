import { Response } from 'express';

export function setTokenCookie(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  // set cookie
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    domain: process.env.NODE_ENV === 'dev' ? undefined : '.nuber.io',
  });
  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    domain: process.env.NODE_ENV === 'dev' ? undefined : '.nuber.io',
  });
}

export function setClearTokenCookie(res: Response) {
  res.clearCookie('access_token', {
    domain: process.env.NODE_ENV === 'dev' ? undefined : '.nuber.io',
  });
  res.clearCookie('refresh_token', {
    domain: process.env.NODE_ENV === 'dev' ? undefined : '.nuber.io',
  });
}

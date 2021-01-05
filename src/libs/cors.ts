import { NextFunction, Request, Response } from 'express';

const cors = (req: Request, res: Response, next: NextFunction) => {
  const allowedHosts = [];

  if (process.env.NODE_ENV === 'dev') {
    allowedHosts.push(/^http:\/\/localhost/);
  }
  const { origin } = req.headers;
  const valid = allowedHosts.some(regex => regex.test(req.headers.origin));
  if (!valid) return next();
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Cookie',
    );
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
  }
  return next();
};

export default cors;

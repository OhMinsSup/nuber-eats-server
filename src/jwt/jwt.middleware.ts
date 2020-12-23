import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { setTokenCookie } from 'src/libs/cookies';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

type TokenData = {
  iat: number;
  exp: number;
  sub: string;
  iss: string;
};

type AccessTokenData = {
  userId: number;
} & TokenData;

type RefreshTokenData = {
  userId: number;
  tokenId: number;
} & TokenData;

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private async refresh(req: Request, res: Response, refreshToken: string) {
    try {
      const decoded = await this.jwtService.decodeToken<RefreshTokenData>(
        refreshToken,
      );
      const user = await this.userService.findById(decoded.userId);
      if (!user) {
        const error = new Error('INVALID_USER_ERROR');
        throw error;
      }

      const tokens = await this.userService.refreshUserToken(
        decoded.userId,
        decoded.tokenId,
        decoded.exp,
        refreshToken,
      );
      setTokenCookie(res, tokens);
      return decoded.userId;
    } catch (e) {
      throw e;
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    let accessToken: string = req.cookies.access_token;
    // tslint:disable-next-line: prefer-const
    const refreshToken: string | undefined = req.cookies.refresh_token;

    const { authorization } = req.headers;
    if (!accessToken && authorization) {
      // eslint-disable-next-line prefer-destructuring
      accessToken = authorization.split(' ')[1];
    }

    try {
      if (!accessToken) {
        return next();
      }

      const accessTokenData = await this.jwtService.decodeToken<
        AccessTokenData
      >(accessToken);
      res.locals.userId = accessTokenData.userId;
      const diff = accessTokenData.exp * 1000 - new Date().getTime();
      if (diff < 1000 * 60 * 30 && refreshToken) {
        await this.refresh(req, res, refreshToken);
      }
    } catch (e) {
      if (!refreshToken) return next();
      // refreshToken이 존재하는 경우
      const userId = await this.refresh(req, res, refreshToken);
      res.locals.userId = userId;
      try {
      } catch (e) {
        throw e;
      }
    }

    return next();
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { JwtService } from 'src/jwt/jwt.service';
import { setTokenCookie } from 'src/libs/cookies';
import { UserService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

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
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private async refresh(refreshToken: string, res?: Response) {
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

      // response가 없는 경우 (웹 소켓)가 존재하기 때문에 해당 처리가 필요
      if (res) {
        setTokenCookie(res, tokens);
      }

      return {
        access: tokens.accessToken,
        refresh: tokens.refreshToken,
        userId: decoded.userId,
      };
    } catch (e) {
      throw e;
    }
  }

  private async consumeUser(
    accessToken?: string,
    refreshToken?: string,
    res?: Response,
  ) {
    try {
      // accessToken 토큰이 없는 경우
      if (!accessToken) {
        throw new Error('NoAccessToken');
      }

      // 토큰이 존재하여 해당 토큰을 decoded하는 코드
      const accessTokenData = await this.jwtService.decodeToken<
        AccessTokenData
      >(accessToken);
      // 만료일 체크
      const diff = accessTokenData.exp * 1000 - new Date().getTime();
      if (diff < 1000 * 60 * 30 && refreshToken) {
        // 만료되면 새로운 토큰 발급및 쿠키 변경
        const { access, refresh } = await this.refresh(refreshToken, res);
        // 재발급된 토큰
        return { access, refresh };
      }
      // 기존 토큰값
      return { access: accessToken, refresh: refreshToken };
    } catch (e) {
      // access token이 없는데 refresh token도 없는 경우
      if (!refreshToken) return { access: null, refresh: null };
      try {
        // refresh token이 존재하여 재발급
        const { access, refresh } = await this.refresh(refreshToken, res);
        // 재발급된 토큰
        return { access, refresh };
      } catch (e) {}
    }
  }

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { access } = await this.consumeUser(
      gqlContext.accessToken,
      gqlContext.refreshToken,
      gqlContext.res,
    );

    const token = access;

    if (token) {
      const decoded = await this.jwtService.decodeToken<{ userId: number }>(
        token,
      );
      if (typeof decoded === 'object' && decoded.hasOwnProperty('userId')) {
        const user = await this.userService.findById(decoded.userId);
        if (user) {
          gqlContext['user'] = user;
          if (roles.includes('Any')) {
            return true;
          }

          return roles.includes(user.role);
        }
      }
    }
  }
}

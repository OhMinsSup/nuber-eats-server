import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RESULT_CODE } from 'src/common/common.constants';
import { MailService } from 'src/mail/mail.service';

import User from './entities/user.entity';
import Verification from './entities/verification.entity';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import UserProfile from './entities/userProfile.entity';
import AuthToken from './entities/authToken.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(UserProfile)
    private readonly userProfies: Repository<UserProfile>,
    @InjectRepository(AuthToken)
    private readonly authTokens: Repository<AuthToken>,
    private readonly mainService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  // 유저 Id를 통해서 유저 찾기
  async findById(id: number) {
    try {
      const user = await this.users.findOne({ id });
      if (!user) return null;
      return user;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 유저 생성
  async createAccount({
    username,
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email, username });

      if (exists) {
        return {
          ok: false,
          code:
            exists.email === email
              ? RESULT_CODE.VALID_EMAIL
              : RESULT_CODE.VALID_USERNAME,
          error:
            exists.email === email
              ? '이미 해당 이메일을 사용하는 사용자가 있습니다.'
              : '이미 해당 유저명을 사용하는 사용자가 있습니다.',
        };
      }

      const user = await this.users.save(
        this.users.create({ username, email, password, role }),
      );

      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      this.mainService.sendVerificationEmail(
        user.email,
        verification.code,
        false,
      );
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 유저 토큰 생성
  async generateUserToken(userId: number) {
    const authToken = await this.authTokens.save(
      this.authTokens.create({
        fk_user_id: userId,
      }),
    );

    // refresh token is valid for 30days
    const refreshToken = await this.jwtService.generateToken(
      {
        userId,
        tokenId: authToken.id,
      },
      {
        subject: 'refresh_token',
        expiresIn: '30d',
      },
    );

    // access token is valid for 1h
    const accessToken = await this.jwtService.generateToken(
      {
        userId,
      },
      {
        subject: 'access_token',
        expiresIn: '1h',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // refresh token 재발급
  async refreshUserToken(
    userId: number,
    tokenId: number,
    refreshTokenExp: number,
    originalRefreshToken: string,
  ) {
    const now = new Date().getTime();
    const diff = refreshTokenExp * 1000 - now;
    console.log('refreshing...');

    let refreshToken = originalRefreshToken;
    // renew refresh token if remaining life is less than 15d
    if (diff < 1000 * 60 * 60 * 24 * 15) {
      console.log('refreshing refreshToken');
      refreshToken = await this.jwtService.generateToken(
        {
          userId,
          tokenId: tokenId,
        },
        {
          subject: 'refresh_token',
          expiresIn: '30d',
        },
      );
    }
    const accessToken = await this.jwtService.generateToken(
      {
        userId,
      },
      {
        subject: 'access_token',
        expiresIn: '1h',
      },
    );

    return { refreshToken, accessToken };
  }
}

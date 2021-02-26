import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import * as DataLoader from 'dataloader';

import { RESULT_CODE } from 'src/common/common.constants';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from 'src/jwt/jwt.service';

import User, { UserRole } from './entities/user.entity';
import Verification from './entities/verification.entity';
import UserProfile from './entities/userProfile.entity';
import AuthToken from './entities/authToken.entity';
import Restaurant from 'src/restaurants/entities/restaurant.entity';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';

import { LoginInput, LoginOutput } from './dtos/login.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { normalize } from 'src/libs/utils';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';

@Injectable()
export class UserService {
  private dataUserLoader: DataLoader<number, User, number>;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(UserProfile)
    private readonly userProfies: Repository<UserProfile>,
    @InjectRepository(AuthToken)
    private readonly authTokens: Repository<AuthToken>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,

    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {
    this.dataUserLoader = new DataLoader<number, User>(
      async (ids: number[]) => {
        const users = await this.users.findByIds(ids, {
          relations: ['profile'],
        });
        const normalized = normalize(users, user => user.id);
        return ids.map(id => normalized[id]);
      },
    );
  }

  // dataloader를 이용한 data fetch
  userLoader(id: number) {
    return this.dataUserLoader.load(id);
  }

  // 레스토랑 오너 회원가입 가입시 유저를 생성하는 것은 같지만 다른점은
  // 이메일 인증에 적힌 주소로 들어가면 해당 주소의 코드값을 가지고 token을 생성
  // 해당 토큰이 유효한 경우에만 이후 등록이 가능하다.

  // 유저 프로필 업데이트
  async editProfile(
    userId: number,
    { email, password, displayName, thumbnail }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      // 이메일이 존재하는 경우
      if (email) {
        user.email = email;
        user.verified = false;
        // 기존에 존재하는 이메일 인증 테이블 삭제
        await this.verifications.delete({ user: { id: user.id } });
        // 그리고 새로 생성한다.
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        // 이메일 발송
        this.mailService.sendVerificationEmail(
          user.email,
          user.username,
          verification.code,
        );
      }

      // 패스워드 변경
      if (password) {
        user.password = password;
      }

      await this.users.save(user);

      const userProfile = await this.userProfies.findOne({ user });
      if (!userProfile)
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_USER_PROFILE,
          error: '유저 프로필이 존재하지 않습니다.',
        };

      if (displayName) {
        userProfile.displayName = displayName;
      }

      if (thumbnail) {
        userProfile.thumbnail = thumbnail;
      }

      await this.userProfies.save(userProfile);

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description ADD: 유저 프로필 정보
   * @param userProfileInput
   */
  async getUserProfile({
    userId,
  }: UserProfileInput): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne(userId, {
        relations: ['profile'],
      });

      if (!user) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_USER,
          error: '유저가 존재하지 않습니다.',
          user: null,
        };
      }
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        user,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description ADD: 회원가입시 이메일 인증 => transaction 추가
   * @param code
   */
  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );

      // 정상적인 방법으로 접근 유저가 아닌 경우
      if (!verification) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_VERFICATION,
          error: '이메일 인증을 메일을 통해서 인증을 해주세요.',
        };
      }

      // 이미 인증한 유저는 또 인증을 하지 않아도 된다.
      if (verification.user.verified) {
        return {
          ok: false,
          code: RESULT_CODE.TOKEN_ALREADY_USED,
          error: '이미 이메일 인증을 한 유저입니다.',
        };
      }

      // 이메일 발송 후 1일이 지났거나 이미 인증한 경우
      const diff =
        new Date().getTime() - new Date(verification.createAt).getTime();
      if (diff > 1000 * 60 * 60 * 24 || verification.user.verified) {
        return {
          ok: false,
          code: RESULT_CODE.EXPIRED_CODE,
          error: '이메일 인증코드가 만료되었습니다.',
        };
      }

      // 인증
      verification.user.verified = true;

      // 메일 인증여부 변경
      const user = await this.users.save(verification.user);
      // 인증에 성공한 경우 인증메일 테이블 삭제
      await this.verifications.delete(verification.id);

      // 유저 프로필 생성
      await this.userProfies.save(
        this.userProfies.create({
          user,
        }),
      );

      await queryRunner.commitTransaction();

      return { ok: true, code: RESULT_CODE.SUCCESS, userId: user.id };
    } catch (e) {
      console.error(e);
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * @version 1.0
   * @description ADD: 유저 로그인 => transaction 추가
   * @param loginInput
   */
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    const nullableReturnValues = {
      userId: null,
      accessToken: null,
      refreshToken: null,
      role: null,
    };

    try {
      // 유저가 존재하는지 체크
      const user = await this.users.findOne(
        {
          email,
        },
        { select: ['id', 'password', 'verified'] },
      );

      if (!user) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_USER,
          error: '존재하지않는 유저입니다. 회원가입을 해주세요.',
          ...nullableReturnValues,
        };
      }

      if (!user.verified) {
        return {
          ok: false,
          code: RESULT_CODE.USER_VERFIED_ERROR,
          error: '이메일 인증이 안된 계정입니다.',
          ...nullableReturnValues,
        };
      }

      // 비밀번호가 일치하는지 체크
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          code: RESULT_CODE.EXISTS_PASSWORD,
          error: '비밀번호가 일치하지않습니다.',
          ...nullableReturnValues,
        };
      }

      const tokens = await this.generateUserToken(user.id);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        userId: user.id,
        role: user.role,
        ...tokens,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description ADD: 유저 생성 => role Owner 레스토랑 생성 + transaction 추가
   * @param createAccountInput
   */
  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.startTransaction();

    const { username, email, password, role } = createAccountInput;

    try {
      // 만약에 role 다른 (같은 유저 이메일및 유저명을 가진 사용자가 있는 경우) ?
      const exists = await this.users.findOne({
        where: [{ email }, { username }],
      });

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

      // Owner로 생성하는 경우 레스토랑을 생성한다.
      if (role === UserRole.Owner) {
        // 레스토랑 생성
        const newRestaurant = this.restaurants.create({
          name: createAccountInput.storeName,
          address: createAccountInput.storeAddress,
          shortBio: createAccountInput.storeShortBio,
          owner: user,
        });
        await this.restaurants.save(newRestaurant);
      }

      // 이메일 인증을 위한 모델 생성
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      // 이메일 발송
      this.mailService.sendVerificationEmail(
        user.email,
        user.username,
        verification.code,
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * @version 1.0
   * @description 유저 Id를 통해서 유저 찾기
   * @param id
   */
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

  /**
   * @version 1.0
   * @description 유저 토큰 생성
   * @param userId
   */
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

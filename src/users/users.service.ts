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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(UserProfile)
    private readonly userProfies: Repository<UserProfile>,
    private readonly mainService: MailService,
  ) {}

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
}

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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly mainService: MailService,
  ) {}

  // 유저 생성
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        return {
          ok: false,
          code: RESULT_CODE.VALID_EMAIL,
          error: '이미 해당 이메일을 사용하는 사용자가 있습니다.',
        };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
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

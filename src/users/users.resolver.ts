import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { ResGql } from 'src/common/common.constants';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { setTokenCookie } from 'src/libs/cookies';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

import User from './entities/user.entity';

import { UserService } from './users.service';

@Resolver(_ => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(_ => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(_ => LoginOutput)
  async login(
    @Args('input') loginInput: LoginInput,
    @ResGql() res: Response,
  ): Promise<LoginOutput> {
    const result = await this.usersService.login(loginInput);
    setTokenCookie(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return result;
  }

  @Mutation(_ => VerifyEmailOutput)
  verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }

  @Query(_ => User)
  @Role(['Any'])
  me(@AuthUser() authUser: User) {
    return this.usersService.userLoader(authUser.id);
  }
}

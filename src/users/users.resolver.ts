import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
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
}

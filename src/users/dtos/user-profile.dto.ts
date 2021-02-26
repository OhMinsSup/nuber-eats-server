/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import User from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(_ => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(_ => User, { nullable: true })
  user?: User;
}

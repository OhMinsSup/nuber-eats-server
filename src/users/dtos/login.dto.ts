/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import User, { UserRole } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(_ => String, { nullable: true })
  accessToken?: string;
  @Field(_ => String, { nullable: true })
  refreshToken?: string;
  @Field(_ => Int, { nullable: true })
  userId?: number;
  @Field(_ => UserRole, { nullable: true })
  role?: UserRole;
}

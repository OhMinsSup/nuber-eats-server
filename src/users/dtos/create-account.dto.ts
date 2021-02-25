import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import User from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'username',
  'email',
  'password',
  'role',
]) {
  @Field(_ => String, { nullable: true })
  storeName?: string;

  @Field(_ => String, { nullable: true })
  storeAddress?: string;

  @Field(_ => String, { nullable: true })
  storeShortBio?: string;
}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}

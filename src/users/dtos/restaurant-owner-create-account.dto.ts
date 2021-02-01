import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import User from '../entities/user.entity';

@InputType()
export class RestaurantOwnerCreateAccountInput extends PickType(User, [
  'username',
  'email',
  'password',
]) {
  @Field(_ => String)
  restaurantName: string;

  @Field(_ => String)
  address: string;

  @Field(_ => String)
  site: string;
}

@ObjectType()
export class RestaurantOwnerCreateAccountOutput extends CoreOutput {}

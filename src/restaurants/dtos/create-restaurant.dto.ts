import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Restaurant from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(_ => String)
  categoryName: string;

  @Field(_ => String)
  openTime: string;

  @Field(_ => String)
  closeTime: string;

  @Field(_ => String)
  description: string;

  @Field(_ => String, { nullable: true })
  closedDays?: string;

  @Field(_ => String, { nullable: true })
  operatingTime?: string;

  @Field(_ => String, { nullable: true })
  phone?: string;

  @Field(_ => String, { nullable: true })
  deliveryArea?: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(_ => Int)
  restaurantId?: number;
}

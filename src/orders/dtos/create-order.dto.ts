import { Field, InputType, Int } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(_ => Int)
  dishId: number;

  @Field(_ => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(_ => Int)
  restaurantId: number;

  @Field(_ => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

export class CreateOrderOutput extends CoreOutput {
  @Field(_ => Int, { nullable: true })
  orderId?: number;
}

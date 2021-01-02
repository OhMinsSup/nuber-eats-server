import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Order, { OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field(_ => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(_ => [Order], { nullable: true })
  orders?: Order[];
}

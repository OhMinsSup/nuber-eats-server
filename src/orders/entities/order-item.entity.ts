import { Field, InputType, ObjectType } from '@nestjs/graphql';
import CoreEntity from 'src/common/entities/core.entity';
import Dish from 'src/dishs/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(_ => String)
  name: string;
  @Field(_ => String, { nullable: true })
  choice: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
class OrderItem extends CoreEntity {
  @Field(_ => Dish)
  @ManyToOne(_ => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(_ => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}

export default OrderItem;

import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import Restaurant from 'src/restaurants/entities/restaurant.entity';
import User from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import OrderItem from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
class Order extends CoreEntity {
  @Field(_ => User, { nullable: true })
  @ManyToOne(
    _ => User,
    user => user.orders,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(_ => User, { nullable: true })
  @ManyToOne(
    _ => User,
    user => user.rides,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(_ => Restaurant, { nullable: true })
  @ManyToOne(
    _ => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  restaurant?: Restaurant;

  @Field(_ => [OrderItem])
  @ManyToMany(_ => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(_ => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(_ => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export default Order;

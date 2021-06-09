/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsUrl, Length } from 'class-validator';

import CoreEntity from 'src/common/entities/core.entity';
import Order from 'src/orders/entities/order.entity';
import User from 'src/users/entities/user.entity';
import Category from './cetegory.entity';
import Dish from '../../dishs/entities/dish.entity';
import RestaurantMeta from './restaurant.meta.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
class Restaurant extends CoreEntity {
  @Field(_ => String)
  @Column({ length: 255 })
  @IsString()
  @Length(2)
  name: string;

  @Field(_ => String, { nullable: true })
  @Column({ length: 255, nullable: true })
  @IsString()
  @IsUrl()
  coverImg: string;

  @Field(_ => String)
  @Column({ length: 255 })
  @IsString()
  address: string;

  @Field(_ => String, { nullable: true })
  @Column({ length: 255, nullable: true })
  @IsString()
  shortBio: string;

  @Field(_ => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(_ => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;

  @Column('int')
  ownerId: number;

  @OneToOne(_ => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Field(_ => [Order])
  @OneToMany(
    _ => Order,
    order => order.restaurant,
  )
  orders: Order[];

  @Field(_ => Category, { nullable: true })
  @ManyToOne(
    _ => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL', eager: true },
  )
  category: Category;

  @Field(_ => [Dish])
  @OneToMany(
    _ => Dish,
    dish => dish.restaurant,
  )
  menu: Dish[];

  @Field(_ => RestaurantMeta)
  @OneToOne(
    _ => RestaurantMeta,
    meta => meta.restaurant,
  )
  meta: RestaurantMeta;
}

export default Restaurant;

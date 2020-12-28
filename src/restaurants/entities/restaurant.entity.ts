import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import User from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import Category from './cetegory.entity';
import Dish from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
class Restaurant extends CoreEntity {
  @Field(_ => String)
  @Column()
  @IsString()
  @Length(2)
  name: string;

  @Field(_ => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(_ => String)
  @Column()
  @IsString()
  address: string;

  @Field(_ => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(_ => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(_ => User)
  @ManyToOne(
    _ => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: User;

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
}

export default Restaurant;

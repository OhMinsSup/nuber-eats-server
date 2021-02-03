import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString, Length } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import Restaurant from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(_ => String)
  name: string;
  @Field(_ => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(_ => String)
  name: string;
  @Field(_ => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field(_ => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
class Dish extends CoreEntity {
  @Field(_ => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(_ => Boolean)
  @Column({ type: 'bool', default: false })
  @IsBoolean()
  isMain: boolean;

  @Field(_ => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(_ => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(_ => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field(_ => Restaurant)
  @ManyToOne(
    _ => Restaurant,
    restaurant => restaurant.menu,
    { onDelete: 'CASCADE' },
  )
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(_ => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];

  // @ManyToMany(type => Tag)
  // @JoinTable({
  //   name: 'post_tags',
  //   joinColumn: {
  //     name: 'fk_post_id'
  //   },
  //   inverseJoinColumn: {
  //     name: 'fk_tag_id'
  //   }
  // })
  // tags!: Tag[];
}

export default Dish;

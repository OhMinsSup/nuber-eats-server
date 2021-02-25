import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import CoreEntity from 'src/common/entities/core.entity';
import Restaurant from './restaurant.entity';

@InputType('RestaurantMetaInputType', { isAbstract: true })
@ObjectType()
@Entity()
class RestaurantMeta extends CoreEntity {
  @Field(_ => String, { nullable: false })
  @Column({ nullable: false })
  @IsString()
  openTime: string;

  @Field(_ => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  closeTime: string;

  @Field(_ => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  @IsString()
  description: string;

  @Field(_ => String)
  @Column()
  @IsString()
  closedDays?: string;

  @Field(_ => String)
  @Column()
  @IsString()
  operatingTime?: string;

  @Field(_ => String)
  @Column()
  @IsString()
  phone?: string;

  @Field(_ => String)
  @Column()
  @IsString()
  deliveryArea?: string;

  @OneToOne(_ => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn()
  restaurant: Restaurant;
}

export default RestaurantMeta;

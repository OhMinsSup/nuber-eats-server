import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { IsString, Max, Min } from 'class-validator';
import User from 'src/users/entities/user.entity';
import CoreEntity from 'src/common/entities/core.entity';
import Restaurant from './restaurant.entity';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
class RestaurantScore extends CoreEntity {
  @IsString()
  @Column({ length: 255 })
  type: string;

  @Min(1)
  @Max(5)
  @Column('float8', {
    default: 0,
  })
  score: number;

  @Index()
  @Column('int')
  restaurantId: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(_ => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}

export default RestaurantScore;

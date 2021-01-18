import CoreEntity from 'src/common/entities/core.entity';
import User from 'src/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import Restaurant from './restaurant.entity';

@Entity()
class RestaurantLike extends CoreEntity {
  @Index({ unique: true })
  @Column('int')
  restaurantId: number;

  @Index({ unique: true })
  @Column('int')
  userId: number;

  @ManyToOne(_ => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(_ => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}

export default RestaurantLike;

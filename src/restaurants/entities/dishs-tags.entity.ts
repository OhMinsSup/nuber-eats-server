import {} from '@nestjs/graphql';
import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import DishTag from './dish-tag.entity';
import Dish from './dish.entity';

@Entity()
class DishsTags extends CoreEntity {
  @Index()
  @Column('number')
  dishId: number;

  @Index()
  @Column('number')
  dishTagId: number;

  @ManyToOne(_ => Dish, { cascade: true, eager: true })
  @JoinColumn({ name: 'dishId' })
  dish: Dish;

  @ManyToOne(_ => DishTag, { cascade: true })
  @JoinColumn({ name: 'dishTagId' })
  dishTag: DishTag;
}

export default DishsTags;

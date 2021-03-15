/* eslint-disable @typescript-eslint/no-unused-vars */
import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import DishCategory from './dish-category.entity';
import Dish from './dish.entity';

@Entity()
@Index(['dishCategoryId', 'dishId'])
class DishsCategorys extends CoreEntity {
  @Column('int')
  dishCategoryId: number; // 메뉴 카테고리 아이디

  @Column('int')
  dishId: number; // 메뉴 아이디

  @ManyToOne(type => Dish, { cascade: true, eager: true })
  @JoinColumn({ name: 'dishId' })
  dish: Dish;

  @ManyToOne(type => DishCategory, { cascade: true, eager: true })
  @JoinColumn({ name: 'dishCategoryId' })
  dishCategory: DishCategory;
}

export default DishsCategorys;

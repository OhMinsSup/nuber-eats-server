import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishResolver } from './dish.resolver';
import { DishService } from './dish.service';
import DishCategory from './entities/dish-category.entity';
import DishSubMenuOption from './entities/dish-submenu-option.entity';
import DishSubMenu from './entities/dish-subMenu.entity';
import Dish from './entities/dish.entity';
import DishsCategorys from './entities/dishs-categorys.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dish,
      DishCategory,
      DishsCategorys,
      DishSubMenu,
      DishSubMenuOption,
    ]),
  ],
  providers: [DishResolver, DishService],
})
export class RestaurantsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { DishResolver } from './dish.resolver';

import Dish from './entities/dish.entity';
import RestaurantMeta from './entities/restaurant.meta.entity';

import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dish,
      RestaurantMeta,
      CategoryRepository,
      RestaurantRepository,
    ]),
  ],
  providers: [
    RestaurantResolver,
    CategoryResolver,
    DishResolver,
    RestaurantService,
    CategoryService,
  ],
})
export class RestaurantsModule {}

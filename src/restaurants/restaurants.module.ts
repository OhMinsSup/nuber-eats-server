import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { DishResolver } from '../dishs/dish.resolver';

import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

import Dish from '../dishs/entities/dish.entity';
import RestaurantMeta from './entities/restaurant.meta.entity';

import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

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

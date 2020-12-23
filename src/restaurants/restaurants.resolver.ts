import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(type => [Restaurant])
  restaurants(): Restaurant[] {
    return [];
  }

  @Mutation(type => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    return true;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import User from 'src/users/entities/user.entity';
import {
  CreateDishInput,
  CreateDishOutput,
} from '../restaurants/dtos/create-dish.dto';
import {
  DeleteDishInput,
  DeleteDishOutput,
} from '../restaurants/dtos/delete-dish.dto';
import {
  EditDishInput,
  EditDishOutput,
} from '../restaurants/dtos/edit-dish.dto';
import Dish from './entities/dish.entity';
import { RestaurantService } from '../restaurants/restaurants.service';

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(_ => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(_ => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(_ => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}

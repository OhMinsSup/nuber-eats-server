import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import {
  AllCategoriesInput,
  AllCategoriesOutput,
} from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category';
import Category from './entities/cetegory.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(_ => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  /**
   * @version 1.1
   * @description 추가 API 카테고리 무한 스크롤 추가
   * @param allCategoriesInput
   */
  @Query(_ => AllCategoriesOutput)
  allCategories(
    @Args('input') allCategoriesInput: AllCategoriesInput,
  ): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories(allCategoriesInput);
  }

  @Query(_ => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

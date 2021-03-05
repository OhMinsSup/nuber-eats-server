/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Int,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { Role } from 'src/auth/role.decorator';
import { CategoryService } from './category.service';
import {
  AllCategoriesInput,
  AllCategoriesOutput,
} from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/create-category.dto';
import {
  DeleteCategoryInput,
  DeleteCategoryOutput,
} from './dtos/delete-category.dto';
import Category from './entities/cetegory.entity';

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @ResolveField(_ => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.categoryService.countRestaurants(category);
  }

  @Mutation(_ => CreateCategoryOutput)
  @Role(['Owner'])
  async createCategory(
    @Args('input') createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    return this.categoryService.createCategory(createCategoryInput);
  }

  @Mutation(_ => DeleteCategoryOutput)
  @Role(['Owner'])
  async deleteCategory(
    @Args('input') deleteCategoryInput: DeleteCategoryInput,
  ): Promise<DeleteCategoryOutput> {
    return this.categoryService.deleteCategory(deleteCategoryInput);
  }

  @Query(_ => AllCategoriesOutput)
  allCategories(
    @Args('input') allCategoriesInput: AllCategoriesInput,
  ): Promise<AllCategoriesOutput> {
    return this.categoryService.allCategories(allCategoriesInput);
  }

  @Query(_ => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.categoryService.findCategoryBySlug(categoryInput);
  }
}

import { Injectable } from '@nestjs/common';
import { RESULT_CODE } from 'src/common/common.constants';
import { getConnection } from 'typeorm';
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
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly restaurants: RestaurantRepository,
  ) {}

  /**
   * @version 1.0
   * @description 카테고리에 대한 정보를 가져온다.
   * @param allCategoriesInput
   */
  async allCategories(
    allCategoriesInput: AllCategoriesInput,
  ): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.getCategoroes(
        allCategoriesInput.cursor,
        allCategoriesInput.limit,
      );

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        categories,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description owner 카테고리 생성 - transaction 추가
   * @params createCategoryInput
   */
  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const category = await this.categories.getOrCreate(
        createCategoryInput.categoryName,
        createCategoryInput.coverImg,
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        category,
      };
    } catch (e) {
      console.error(e);
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * @version 1.0
   * @description owner 카테고리 삭제 - transaction 추가
   * @params deleteCategoryInput
   */
  async deleteCategory({
    categoryId,
  }: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const category = await this.categories.findOne({
        id: categoryId,
      });
      if (!category) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_CATEGORY,
          error: '카테고리가 존재하지 않습니다.',
        };
      }

      const [_, count] = await this.restaurants.findAndCount({
        where: {
          category,
        },
      });

      if (count) {
        return {
          ok: false,
          code: RESULT_CODE.DELETED_CONTENT_CATEGORY,
        };
      }

      await this.categories.delete({ id: categoryId });

      await queryRunner.commitTransaction();

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }

  /**
   * @version 1.0
   * @param categoryInput
   * @description 카테고리에 해당하는 가게 정보 리스트
   */
  async findCategoryBySlug({
    slug,
    page,
    pageSize,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_CATEGORY,
          error: '카테고리가 존재하지 않습니다.',
        };
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        order: {
          isPromoted: 'DESC',
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description 카테고리에 해당하는 레스토랑 수
   * @param category
   */
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }
}

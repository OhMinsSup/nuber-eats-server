import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DataLoader from 'dataloader';
import { RESULT_CODE } from 'src/common/common.constants';
import { normalize } from 'src/libs/utils';
import User from 'src/users/entities/user.entity';
import { getConnection, Repository } from 'typeorm';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  GetRestaurantsInput,
  GetRestaurantsOutput,
} from './dtos/get-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import Category from './entities/cetegory.entity';
import Dish from '../dishs/entities/dish.entity';
import Restaurant from './entities/restaurant.entity';
import RestaurantMeta from './entities/restaurant.meta.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  private dataRestaurantLoader: DataLoader<number, Restaurant, number>;

  constructor(
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(RestaurantMeta)
    private readonly metas: Repository<RestaurantMeta>,
    private readonly categories: CategoryRepository,
    private readonly restaurants: RestaurantRepository,
  ) {
    this.dataRestaurantLoader = new DataLoader<number, Restaurant>(
      async (ids: number[]) => {
        const restaurants = await this.restaurants.findByIds(ids, {
          relations: ['menu'],
        });
        const normalized = normalize(restaurants, restaurant => restaurant.id);
        return ids.map(id => normalized[id]);
      },
    );
  }

  // dataloader를 이용한 data fetch
  userLoader(id: number) {
    return this.dataRestaurantLoader.load(id);
  }

  /**
   * @version 1.0
   * @description ADD: 나의 레스토랑 정보를 가져온다.
   * @param owner
   * @param editRestaurantInput
   */
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurant,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 가게 리스트 (무한 스크롤)
  async getRestaurants(
    getRestaurantsInput: GetRestaurantsInput,
  ): Promise<GetRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.getRestaurants(
        getRestaurantsInput.cursor,
        getRestaurantsInput.limit,
      );

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurants,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 가게 리스트
  async allRestaurants({
    page,
    pageSize,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        results: restaurants,
        totalPages: Math.ceil(totalResults / pageSize),
        totalResults,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 가게 검색
  async searchRestaurantByName({
    query,
    type,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const restaurants = await this.restaurants.searchInputRestaurantNames(
        query,
        type,
      );
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurants,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 가게 찾기
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.userLoader(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_RESTAURANT,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurant,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * @version 1.0
   * @description ADD: 가게 수정 => transaction 추가
   * @param owner
   * @param editRestaurantInput
   */
  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    const queryRunner = getConnection().createQueryRunner();

    try {
      await queryRunner.startTransaction();

      const restaurant = await queryRunner.manager.findOne(
        Restaurant,
        editRestaurantInput.restaurantId,
      );

      if (!restaurant) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_RESTAURANT,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          code: RESULT_CODE.AUTHENTICATION_ERROR,
          error: '소유하지 않은 레스토랑은 수정 할 수 없습니다.',
        };
      }

      let category: Category | null = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
          editRestaurantInput.coverImg,
          queryRunner,
        );
      }

      await queryRunner.manager.save(Restaurant, [
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

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

  // 가게 삭제
  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_RESTAURANT,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          code: RESULT_CODE.AUTHENTICATION_ERROR,
          error: '소유하지 않은 레스토랑은 수정 할 수 없습니다.',
        };
      }
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // ================ DISH ================== //

  // 메뉴 생성
  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_RESTAURANT,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          code: RESULT_CODE.AUTHENTICATION_ERROR,
          error: '소유하지 않은 레스토랑은 수정 할 수 없습니다.',
        };
      }

      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 메뉴 수정
  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_DISH,
          error: '메뉴를 찾을 수 없습니다.',
        };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          code: RESULT_CODE.AUTHENTICATION_ERROR,
          error: '소유하지 않은 레스토랑은 수정 할 수 없습니다.',
        };
      }

      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 메뉴 삭제
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_DISH,
          error: '메뉴를 찾을 수 없습니다.',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          code: RESULT_CODE.AUTHENTICATION_ERROR,
          error: '소유하지 않은 레스토랑은 수정 할 수 없습니다.',
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

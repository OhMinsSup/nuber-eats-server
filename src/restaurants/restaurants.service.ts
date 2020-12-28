import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DataLoader from 'dataloader';
import { RESULT_CODE } from 'src/common/common.constants';
import { normalize } from 'src/libs/utils';
import User from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import Category from './entities/cetegory.entity';
import Dish from './entities/dish.entity';
import Restaurant from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  private dataRestaurantLoader: DataLoader<number, Restaurant, number>;

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
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

  // 가게 찾기
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      // const restaurant = await this.restaurants.findOne(restaurantId, {
      //   relations: ['menu'],
      // });
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

  // 가게 생성
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        restaurantId: newRestaurant.id,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 가게 수정
  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
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
        );
      }

      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
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
}

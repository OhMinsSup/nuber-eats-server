import { EntityRepository, Repository, Raw, FindOperator } from 'typeorm';
import { SearchTypeStatus } from '../dtos/search-restaurant.dto';
import Restaurant from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  searchInputRestaurantNames(query: string, type: SearchTypeStatus) {
    return this.find({
      relations: ['meta'],
      where: {
        name: Raw(name => `${name} ILIKE '%${query}%'`),
        address: Raw(address => `${address} ILIKE '%${query}%'`),
      },
      take: 25,
    });
  }

  async getRestaurants(cursor?: number, limit = 40) {
    if (!cursor) {
      return this.find({
        relations: ['orders', 'category', 'owner'],
        order: {
          isPromoted: 'DESC',
          id: 'ASC',
        },
        take: limit,
      });
    }

    const cursorRestaurant = (await this.findOne(cursor)) || null;

    if (!cursorRestaurant) {
      throw new Error('Invalid restaurant');
    }

    const restaurants = await this.find({
      relations: ['orders', 'category', 'owner'],
      where: {
        id: Raw(alias => `${alias} != :id and not ${alias} < :id`, {
          id: cursor,
        }),
      },
      order: {
        isPromoted: 'DESC',
        id: 'ASC',
      },
      take: limit,
    });

    return restaurants;
  }
}

import { EntityRepository, Repository, Raw } from 'typeorm';
import Restaurant from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async getRestaurants(cursor?: number, limit = 40) {
    if (!cursor) {
      return this.find({
        relations: ['orders', 'category'],
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
      relations: ['orders', 'category'],
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

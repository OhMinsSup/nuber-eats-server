import { EntityRepository, getManager, Repository } from 'typeorm';
import { RawCategoriesData } from '../dtos/all-categories.dto';
import Category from '../entities/cetegory.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }

  async getCategoroes(
    cursor?: number,
    limit = 40,
  ): Promise<Category[] | RawCategoriesData[]> {
    if (!cursor) {
      return this.find({
        take: limit,
        order: {
          id: 'ASC',
        },
      });
    }

    const cursorCategory = (await this.findOne(cursor)) || null;

    if (!cursorCategory) {
      throw new Error('Invalid category');
    }

    const manager = getManager();
    const categories = await manager.query(
      `
      select ca.id, ca.name, ca."coverImg", ca.slug, ca."createAt", ca."updateAt", restaurantCount from (
        select count(*) as restaurantCount, restaurant."categoryId" from restaurant
        inner join category as ca1 on ca1.id = restaurant."categoryId"
        group by restaurant."categoryId"
      ) as re
      inner join category as ca on re."categoryId" = ca.id
      where id != $1 and not id < $1
      order by restaurantCount desc, ca.id
      limit $2`,
      [cursor, limit],
    );

    return categories;
  }
}

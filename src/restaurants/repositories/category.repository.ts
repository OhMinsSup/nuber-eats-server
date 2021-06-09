import { EntityRepository, getManager, QueryRunner, Repository } from 'typeorm';
import { RawCategoriesData } from '../dtos/all-categories.dto';
import Category from '../entities/cetegory.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  /**
   * @version 1.0
   * @description 카테고리가 존재하면 존재하는 카테고리를 넘겨주고 없으면 카테고리 생성  ADD: 카테고리 => transaction queryRunner 추가
   * @param name
   * @param coverImg
   * @param queryRunner
   */
  async getOrCreate(
    name: string,
    coverImg?: string,
    queryRunner?: QueryRunner,
  ): Promise<Category> {
    if (queryRunner) {
      const categoryName = name.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await queryRunner.manager.findOne(Category, {
        slug: categorySlug,
      });

      if (!category) {
        const categoryRepo = new Category();
        categoryRepo.name = categoryName;
        categoryRepo.slug = categorySlug;
        categoryRepo.coverImg = coverImg;

        category = await queryRunner.manager.save(categoryRepo);
      }
      return category;
    }

    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName, coverImg }),
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

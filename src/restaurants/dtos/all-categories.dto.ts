import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { SortingType } from 'src/common/entities/core.entity';
import Category from '../entities/cetegory.entity';

export interface RawCategoriesData
  extends Pick<
    Category,
    'id' | 'coverImg' | 'createAt' | 'name' | 'slug' | 'updateAt'
  > {
  restaurantCount: number;
}

@InputType()
export class AllCategoriesInput {
  @Field(_ => Int, { nullable: true })
  cursor?: number;

  @Field(_ => SortingType, { nullable: true })
  sort?: SortingType;

  @Field(_ => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(_ => [Category], { nullable: true })
  categories?: Category[] | RawCategoriesData[];
}

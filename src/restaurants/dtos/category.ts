import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import Category from '../entities/cetegory.entity';
import Restaurant from '../entities/restaurant.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(_ => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(_ => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(_ => Category, { nullable: true })
  category?: Category;
}

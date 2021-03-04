/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Category from '../entities/cetegory.entity';

@InputType()
export class CreateCategoryInput {
  @Field(_ => String)
  categoryName: string;

  @Field(_ => String)
  coverImg: string;
}

@ObjectType()
export class CreateCategoryOutput extends CoreOutput {
  @Field(_ => Category, { nullable: true })
  category?: Category;
}

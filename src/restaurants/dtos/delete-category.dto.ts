import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteCategoryInput {
  @Field(_ => Int)
  categoryId: number;
}

@ObjectType()
export class DeleteCategoryOutput extends CoreOutput {}

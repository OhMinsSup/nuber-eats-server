import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(_ => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(_ => Int, { nullable: true })
  totalPages?: number;

  @Field(_ => Int, { nullable: true })
  totalResults?: number;
}

import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Restaurant from '../entities/restaurant.entity';

@InputType()
export class GetRestaurantsInput {
  @Field(_ => Int, { nullable: true })
  cursor?: number;

  @Field(_ => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class GetRestaurantsOutput extends CoreOutput {
  @Field(_ => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

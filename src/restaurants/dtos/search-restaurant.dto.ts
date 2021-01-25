import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Restaurant from '../entities/restaurant.entity';

export enum SearchTypeStatus {
  Deliver = 'Deliver',
  Shedule = 'Shedule',
}

registerEnumType(SearchTypeStatus, { name: 'SearchTypeStatus' });

@InputType()
export class SearchRestaurantInput {
  @Field(_ => String)
  query: string;

  @Field(_ => SearchTypeStatus)
  type: SearchTypeStatus;
}

@ObjectType()
export class SearchRestaurantOutput extends CoreOutput {
  @Field(_ => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

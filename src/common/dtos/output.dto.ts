import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field(_ => String, { nullable: true })
  error?: string;

  @Field(_ => Boolean)
  ok: boolean;

  @Field(_ => Int)
  code: number;
}

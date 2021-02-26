/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import Verification from '../entities/verification.entity';

@ObjectType()
export class VerifyEmailOutput extends CoreOutput {
  @Field(_ => Int, { nullable: true })
  userId?: number;
}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class OwnerSendEmailInput {
  @Field(_ => String)
  email: string;
}

@ObjectType()
export class OwnerSendEmailOutput extends CoreOutput {
  @Field(_ => Boolean)
  registered: boolean;
}

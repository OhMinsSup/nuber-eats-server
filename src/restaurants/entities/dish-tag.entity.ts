import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, Index } from 'typeorm';

@InputType('DishTagInputType', { isAbstract: true })
@ObjectType()
@Entity()
class DishTag extends CoreEntity {
  @Index()
  @Field(_ => String)
  @Column({ length: 255 })
  @IsString()
  name: string;

  @Field(_ => Boolean)
  @Column({ type: 'bool', default: false })
  @IsBoolean()
  isMain: boolean;

  @Field(_ => Boolean)
  @Column({ type: 'bool', default: false })
  @IsBoolean()
  hasSubDish: boolean;
}

export default DishTag;

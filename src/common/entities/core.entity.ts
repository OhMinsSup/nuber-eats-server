import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(_ => Number)
  id: number;

  @CreateDateColumn()
  @Field(_ => Date)
  createAt: Date;

  @UpdateDateColumn()
  @Field(_ => Date)
  updateAt: Date;
}

export default CoreEntity;

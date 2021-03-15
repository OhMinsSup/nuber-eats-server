/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SortingType {
  Alphabetical = 'alphabetical',
  Trending = 'trending',
}

registerEnumType(SortingType, { name: 'SortingType' });

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

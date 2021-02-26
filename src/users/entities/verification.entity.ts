/* eslint-disable @typescript-eslint/no-unused-vars */
import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import CoreEntity from 'src/common/entities/core.entity';
import User from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
class Verification extends CoreEntity {
  @Index()
  @Column()
  @Field(_ => String)
  code: string;

  @OneToOne(_ => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}

export default Verification;

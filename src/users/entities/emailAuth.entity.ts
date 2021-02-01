import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsString } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, Index } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
class EmailAuth extends CoreEntity {
  @Index()
  @Column({ length: 255 })
  @Field(_ => String)
  @IsString()
  code: string;

  @Column({ length: 255 })
  @Field(_ => String)
  @IsString()
  @IsEmail()
  email: string;

  @Column({ default: false })
  @Field(_ => Boolean)
  @IsBoolean()
  logged: boolean;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}

export default EmailAuth;

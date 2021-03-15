/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import CoreEntity from 'src/common/entities/core.entity';
import User from 'src/users/entities/user.entity';

@InputType('DishCategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
class DishCategory extends CoreEntity {
  @Column('int')
  userId: number; // 메뉴 카테고리를 등록한 사람

  @Index()
  @Field(type => String)
  @Column({ length: 255 })
  @IsString()
  category: string; // 메뉴별 카테고리 (대표메뉴, 서브메뉴, 음료)

  @Field(type => Boolean)
  @Column({ type: 'bool', default: false })
  @IsBoolean()
  isMain: boolean; // 대표메뉴

  @ManyToOne(type => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'userId' })
  user: User; // 메뉴 카테고리를 등록한 사람
}

export default DishCategory;

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Column, Entity } from 'typeorm';
import CoreEntity from 'src/common/entities/core.entity';

@InputType('DishMenuInputType', { isAbstract: true })
@ObjectType()
@Entity()
class DishSubMenu extends CoreEntity {
  @Field(_ => String)
  @Column({ length: 255 })
  @IsString()
  title: string; // 메뉴 이름

  @Field(_ => Int)
  @Column({ type: 'int' })
  @IsNumber()
  appendPrice: number; // 메뉴 추가 가격
}

export default DishSubMenu;

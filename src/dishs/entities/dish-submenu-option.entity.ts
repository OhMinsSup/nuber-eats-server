/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import CoreEntity from 'src/common/entities/core.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum DishSubMenuOptionRole {
  Checkbox = 'Checkbox',
  Radio = 'Radio',
}

registerEnumType(DishSubMenuOptionRole, { name: 'DishSubMenuOptionRole' });

@InputType('DishSubMenuOption', { isAbstract: true })
@ObjectType()
@Entity()
class DishSubMenuOption extends CoreEntity {
  @Column({ type: 'enum', enum: DishSubMenuOptionRole })
  @Field(_ => DishSubMenuOptionRole)
  @IsEnum(DishSubMenuOptionRole)
  optionRole: DishSubMenuOptionRole; // 서브메뉴 그룹화 및 어떤 타입으로 그룹화 할껀지

  @Field(_ => Int)
  @Column({ type: 'int', default: 1 })
  @IsNumber()
  limit: number; // 최대 등록 갯수
}

export default DishSubMenuOption;

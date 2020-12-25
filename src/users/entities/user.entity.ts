import CoreEntity from 'src/common/entities/core.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import UserProfile from './userProfile.entity';
import Restaurant from 'src/restaurants/entities/restaurant.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
class User extends CoreEntity {
  @Column({ unique: true })
  @Field(_ => String)
  @IsString()
  username: string;

  @Column({ unique: true })
  @Field(_ => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(_ => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(_ => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(_ => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(_ => UserProfile)
  @OneToOne(
    _ => UserProfile,
    profile => profile.user,
  )
  profile: UserProfile;

  @Field(_ => [Restaurant])
  @OneToMany(
    _ => Restaurant,
    restaurant => restaurant.owner,
  )
  restaurants: Restaurant[];

  // 패스워드 해시로 변경
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.error(e);
        throw new InternalServerErrorException();
      }
    }
  }

  // 패스워드 체크 (같은 패스워드인지 체크)
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const result = await bcrypt.compare(aPassword, this.password);
      return result;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}

export default User;

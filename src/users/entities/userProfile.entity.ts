import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsUrl } from 'class-validator';
import CoreEntity from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import User from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
class UserProfile extends CoreEntity {
  @Column({ length: 255, nullable: true })
  @Field(_ => String)
  @IsString()
  displayName?: string;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  @Field(_ => String)
  @IsUrl()
  thumbnail?: string;

  @OneToOne(_ => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}

export default UserProfile;

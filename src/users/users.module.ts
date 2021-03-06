import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Restaurant from 'src/restaurants/entities/restaurant.entity';
import RestaurantMeta from 'src/restaurants/entities/restaurant.meta.entity';

import AuthToken from './entities/authToken.entity';
import User from './entities/user.entity';
import UserProfile from './entities/userProfile.entity';
import Verification from './entities/verification.entity';

import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Verification,
      UserProfile,
      AuthToken,
      Restaurant,
      RestaurantMeta,
    ]),
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}

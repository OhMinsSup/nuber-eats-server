import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import Verification from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [],
  exports: [],
})
export class UserModule {}

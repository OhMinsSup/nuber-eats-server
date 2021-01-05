import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request, Response } from 'express';

import { RestaurantsModule } from './restaurants/restaurants.module';
import User from './users/entities/user.entity';
import Verification from './users/entities/verification.entity';
import { UserModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import UserProfile from './users/entities/userProfile.entity';
import AuthToken from './users/entities/authToken.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import Restaurant from './restaurants/entities/restaurant.entity';
import Dish from './restaurants/entities/dish.entity';
import Category from './restaurants/entities/cetegory.entity';
import Order from './orders/entities/order.entity';
import OrderItem from './orders/entities/order-item.entity';
import { OrderModule } from './orders/orders.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        UserProfile,
        AuthToken,
        Restaurant,
        Dish,
        Category,
        Order,
        OrderItem,
      ],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      cors: {
        origin: [/^http:\/\/localhost/],
        credentials: true,
      },
      context: ({
        req,
        res,
        connection,
      }: {
        req: Request;
        res: Response;
        connection: any;
      }) => {
        let accessToken = null;
        let refreshToken = null;

        if (req) {
          let token = req.cookies.access_token;
          if (!token && req.headers['authorization']) {
            // eslint-disable-next-line prefer-destructuring
            token = req.headers['authorization'].split(' ')[1];
          }

          accessToken = token || null;
          refreshToken = req.cookies.refresh_token || null;
        } else {
          accessToken = connection.context['access_token'];
          refreshToken = connection.context['refresh_token'];
        }

        try {
          return {
            res,
            accessToken,
            refreshToken,
          };
        } catch (e) {
          return {};
        }
      },
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    UserModule,
    RestaurantsModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

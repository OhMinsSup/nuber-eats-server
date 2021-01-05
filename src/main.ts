import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as compression from 'compression';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());

  const allowedHosts = [];

  if (process.env.NODE_ENV === 'dev') {
    allowedHosts.push(/^http:\/\/localhost/);
  }

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, false);
      const valid = allowedHosts.some(regext => regext.test(origin));
      if (!valid) return callback(null, false);
      return callback(null, true);
    },
  });

  await app.listen(4000);
}

bootstrap();

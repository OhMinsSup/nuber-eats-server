import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfact';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  async generateToken(payload: any, options?: SignOptions): Promise<string> {
    const jwtOptions: SignOptions = {
      issuer: 'nuber.eats',
      expiresIn: '7d',
      ...options,
    };

    if (!jwtOptions.expiresIn) {
      delete jwtOptions.expiresIn;
    }

    return new Promise((resolve, reject) => {
      jwt.sign(payload, this.options.privateKey, jwtOptions, (err, token) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  }

  async decodeToken<T = any>(token: string): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.options.privateKey, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded as any);
      });
    });
  }
}

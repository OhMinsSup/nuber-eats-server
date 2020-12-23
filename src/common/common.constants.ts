import { createParamDecorator } from '@nestjs/common';
import { Response } from 'express';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const PUB_SUB = 'PUB_SUB';
export const NEW_PENDING_ORDER = 'NEW_PENDING_ORDER';
export const NEW_COOKED_ORDER = 'NEW_COOKED_ORDER';
export const NEW_ORDER_UPDATE = 'NEW_ORDER_UPDATE';

export const RESULT_CODE = {
  SUCCESS: 10000,
  FAILE: 10001,

  VALID_EMAIL: 20001,
  VALID_USERNAME: 20002,

  EXISTS_PASSWORD: 30000,
  EXPIRED_CODE: 30001,
  TOKEN_ALREADY_USED: 30002,

  NOT_FOUND_USER: 40000,
  NOT_FOUND_VERFICATION: 40001,
};

export const ResGql = createParamDecorator(
  (data, [root, args, ctx, info]): Response => ctx.res,
);

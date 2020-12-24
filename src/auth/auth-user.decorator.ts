import { createParamDecorator } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: any, [root, args, ctx, info]) => {
    return ctx.user;
  },
);
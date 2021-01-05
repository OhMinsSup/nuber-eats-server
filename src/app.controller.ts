import { Controller, Get } from '@nestjs/common';

@Controller('/api/v1')
export class AppController {
  @Get('/check')
  checked() {
    return 'v1';
  }
}

import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { AlgoliaModuleOptions } from './algolia.interface';
import { AlgoliaService } from './algolia.service';

@Module({})
@Global()
export class AlgoliaModule {
  static forRoot(options: AlgoliaModuleOptions): DynamicModule {
    return {
      module: AlgoliaModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        AlgoliaService,
      ],
      exports: [AlgoliaService],
    };
  }
}

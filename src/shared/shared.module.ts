import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { RedisSharedService } from './services/redis.service';
import { DatetimeService } from './services/datetime.service';
import { ElasticsearchService } from './services/elasticsearch.service';
import { LoggerService } from './services/logger.service';
import { MessagingService } from './services/messaging/services/messaging.service';
import { RedisModule } from './redis.module';

import { DefaultIfEmptyInterceptor } from './interceptors/default-if-empty.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

const providers = [
  RedisSharedService,
  ConfigService,
  DatetimeService,
  ElasticsearchService,
  LoggerService,
  MessagingService,
];

@Global()
@Module({
  providers: [
    ...providers,
    {
      provide: APP_INTERCEPTOR,
      useClass: DefaultIfEmptyInterceptor,
    },
  ],
  imports: [HttpModule, RedisModule],
  exports: [...providers, HttpModule, RedisModule],
})
export class SharedModule {}

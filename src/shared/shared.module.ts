import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { RedisSharedService } from './services/redis.service';
import { DatetimeService } from './services/datetime.service';
import { ElasticsearchService } from './services/elasticsearch.service';
import { LoggerService } from './services/logger.service';

const providers = [
  RedisSharedService,
  ConfigService,
  DatetimeService,
  ElasticsearchService,
  LoggerService,
];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}

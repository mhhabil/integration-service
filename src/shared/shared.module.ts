import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { RedisSharedService } from './services/redis.service';
import { DatetimeService } from './services/datetime.service';

const providers = [RedisSharedService, ConfigService, DatetimeService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}

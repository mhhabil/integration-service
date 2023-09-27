import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { RedisSharedService } from './services/redis.service';

const providers = [RedisSharedService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}

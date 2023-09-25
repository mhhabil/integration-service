import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TerminusModule,
    ThrottlerModule.forRoot([
      {
        ttl: +process.env.THROTTLER_TTL,
        limit: +process.env.THROTTLER_LIMIT,
      },
    ]),
    RedisModule.forRoot({
      readyLog: true,
      errorLog: true,
      config: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        db: +process.env.REDIS_DATABASE,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

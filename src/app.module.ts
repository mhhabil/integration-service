import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import RequiredModules from './modules';

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
      config: [
        {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          db: +process.env.REDIS_DATABASE,
        },
        {
          namespace: 'RBAC',
          host: process.env.RBAC_REDIS_HOST,
          port: +process.env.RBAC_REDIS_PORT,
          username: process.env.RBAC_REDIS_USERNAME,
          password: process.env.RBAC_REDIS_PASSWORD,
          db: +process.env.RBAC_REDIS_DATABASE,
        },
      ],
    }),
    AuthModule,
    ...RequiredModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import RequiredModules from './modules';
import { ConfigService } from './shared/services/config.service';

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
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: [
            {
              host: configService.redis.host,
              port: +configService.redis.port,
              username: configService.redis.user,
              password: configService.redis.password,
              db: +configService.redis.db,
            },
            {
              namespace: 'RBAC',
              host: configService.redisRBAC.host,
              port: +configService.redisRBAC.port,
              username: configService.redisRBAC.user,
              password: configService.redisRBAC.password,
              db: +configService.redisRBAC.db,
            },
          ],
        };
      },
    }),
    AuthModule,
    ...RequiredModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

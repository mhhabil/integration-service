import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, NextFunction } from 'express';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { ExternalSatuSehatService } from 'src/shared/services/satusehat/external.satusehat.service';
import { AuthSatuSehat } from './interfaces/auth-satusehat';

@Injectable()
export class SatuSehatMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisSharedService,
    private readonly externalSatuSehat: ExternalSatuSehatService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = await this.redisService.get(
        `Auth:{SatuSehat}:${req.query.hospital_id}`,
        '.',
      );
      if (token) {
        const expiresIn = new Date(token.expired_at);
        const currentTime = new Date();
        if (expiresIn.getTime() < currentTime.getTime()) {
          const data = await this.externalSatuSehat.oauth(
            req.query.hospital_id as string,
          );
          const storeData = AuthSatuSehat.create(data);
          await this.redisService.set(
            `Auth:{SatuSehat}:${req.query.hospital_id}`,
            '$',
            storeData,
          );
          next();
        } else {
          next();
        }
      } else {
        const data = await this.externalSatuSehat.oauth(
          req.query.hospital_id as string,
        );
        const storeData = AuthSatuSehat.create(data);
        await this.redisService.set(
          `Auth:{SatuSehat}:${req.query.hospital_id}`,
          '$',
          storeData,
        );
        next();
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

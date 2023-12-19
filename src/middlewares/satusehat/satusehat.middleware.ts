import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, NextFunction, Response } from 'express';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { ExternalSatuSehatService } from 'src/shared/services/satusehat/services/external.satusehat.service';
import { AuthSatuSehat } from './interfaces/auth-satusehat';

@Injectable()
export class SatuSehatMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisSharedService,
    private readonly externalSatuSehat: ExternalSatuSehatService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.redisService.get(
        `Auth:{SatuSehat}:${req.query.hospital_id}`,
        '.',
      );
      if (session) {
        const expiresIn = new Date(session.expired_at);
        const currentTime = new Date();
        if (expiresIn.getTime() < currentTime.getTime()) {
          const data = await this.externalSatuSehat.oauth(
            req.query.hospital_id as string,
          );
          if (data && data.error) {
            res.status(HttpStatus.FORBIDDEN).json(data);
          } else {
            const storeData = AuthSatuSehat.create(data);
            await this.redisService.set(
              `Auth:{SatuSehat}:${req.query.hospital_id}`,
              '$',
              storeData,
            );
            next();
          }
        } else {
          next();
        }
      } else {
        const data = await this.externalSatuSehat.oauth(
          req.query.hospital_id as string,
        );
        if (data && data.error) {
          res.status(HttpStatus.FORBIDDEN).json(data);
        } else {
          const storeData = AuthSatuSehat.create(data);
          await this.redisService.set(
            `Auth:{SatuSehat}:${req.query.hospital_id}`,
            '$',
            storeData,
          );
          next();
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

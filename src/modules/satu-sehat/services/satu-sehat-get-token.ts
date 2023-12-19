import { Injectable } from '@nestjs/common';
import { AuthSatuSehat } from 'src/middlewares/satusehat/interfaces/auth-satusehat';
import { RedisSharedService } from 'src/shared/services/redis.service';
import { ExternalSatuSehatService } from 'src/shared/services/satusehat/services/external.satusehat.service';

@Injectable()
export class SatusehatAuthService {
  constructor(
    private _redisService: RedisSharedService,
    private _externalSatusehat: ExternalSatuSehatService,
  ) {}

  async check(hospitalId: string) {
    try {
      const session = await this._redisService.get(
        `Auth:{SatuSehat}:${hospitalId}`,
        '.',
      );
      if (session) {
        const expiresIn = new Date(session.expired_at);
        const currentTime = new Date();
        if (expiresIn.getTime() < currentTime.getTime()) {
          const data = await this._externalSatusehat.oauth(hospitalId);
          if (data && data.error) {
            return false;
          } else {
            const storeData = AuthSatuSehat.create(data);
            await this._redisService.set(
              `Auth:{SatuSehat}:${hospitalId}`,
              '$',
              storeData,
            );
            return storeData.access_token;
          }
        } else {
          return session.access_token;
        }
      } else {
        const data = await this._externalSatusehat.oauth(hospitalId);
        if (data && data.error) {
          return false;
        } else {
          const storeData = AuthSatuSehat.create(data);
          await this._redisService.set(
            `Auth:{SatuSehat}:${hospitalId}`,
            '$',
            storeData,
          );
          return storeData.access_token;
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

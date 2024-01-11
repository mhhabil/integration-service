import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  constants,
  createCipheriv,
  generateKeyPair,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  createPrivateKey,
  createDecipheriv,
} from 'crypto';
import { catchError, firstValueFrom } from 'rxjs';
import { RedisSharedService } from 'src/shared/services/redis.service';
import {
  IGetSatusehatKyc,
  ISatusehatKycInitiateDto,
  SatusehatKycInitiateDto,
} from '../dtos/satu-sehat-kyc-initiate.dto';
import { AxiosError } from 'axios';
import * as fs from 'fs';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { LoggerService } from 'src/shared/services/logger.service';
import * as path from 'path';

@Injectable()
export class SatusehatKYC {
  private readonly IV_LENGTH = 12;
  private readonly TAG_LENGTH = 16;
  private readonly KEY_SIZE = 256;
  private readonly ENCRYPTED_TAG = {
    BEGIN: '-----BEGIN ENCRYPTED MESSAGE-----',
    END: '-----END ENCRYPTED MESSAGE-----',
  };

  constructor(
    private readonly _httpService: HttpService,
    private readonly _redisService: RedisSharedService,
    private readonly _datetimeService: DatetimeService,
    private readonly _loggerService: LoggerService,
  ) {}

  async getServerPem() {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const pathname = `docs/publicKey.pem`;
    const paths: Array<string> = pathname.split('/');
    let directory = __dirname;
    if (!fs.existsSync(path.resolve(__dirname, pathname))) {
      for (let i = 0; i < paths.length - 1; i++) {
        if (paths[i] !== '') {
          directory = `${directory}/${paths[i]}`;
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
          }
        }
      }
      try {
        fs.writeFileSync(path.resolve(__dirname, pathname), config.kyc_pub_key);
        return fs.readFileSync(path.resolve(__dirname, pathname), 'utf8');
      } catch (err) {
        console.error(err);
        return undefined;
      }
    } else {
      return fs.readFileSync(path.resolve(__dirname, pathname), 'utf8');
    }
  }

  async getKeyPair(): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      generateKeyPair(
        'rsa',
        {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        },
        (err, publicKey, privateKey) => {
          if (err) reject(err);
          resolve([publicKey, privateKey]);
        },
      );
    });
  }

  generateSecretKey() {
    const key = randomBytes(this.KEY_SIZE / 8);
    return key;
  }

  generateIV() {
    const key = randomBytes(this.IV_LENGTH);
    return key;
  }

  async encryptMessage(data: string, secretKey: Buffer, iv: Buffer) {
    const cipher = createCipheriv('aes-256-gcm', secretKey, iv);
    const encryptedMessage = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    const encryptedKey = await this.encryptKey(secretKey);

    return [encryptedKey, iv, encryptedMessage, tag];
  }

  async decryptMessage(data: string, privateKey: string): Promise<string> {
    const content = data
      .replace(this.ENCRYPTED_TAG.BEGIN, '')
      .replace(this.ENCRYPTED_TAG.END, '')
      .replace(/\s+/g, '');
    const contentBuffer = Buffer.from(content, 'base64');
    const aesKey = contentBuffer.subarray(0, this.KEY_SIZE);
    const message = contentBuffer.subarray(this.KEY_SIZE);
    const decryptedKey = this.decryptKey(privateKey, aesKey);

    const iv = message.subarray(0, this.IV_LENGTH);
    const tag = message.subarray(-this.TAG_LENGTH);
    const cipher = message.subarray(this.IV_LENGTH, -this.TAG_LENGTH);

    const decipher = createDecipheriv('aes-256-gcm', decryptedKey, iv);
    decipher.setAuthTag(tag);

    const decryptedMessage = Buffer.concat([
      decipher.update(cipher.toString('binary'), 'binary'),
      decipher.final(),
    ]);

    return decryptedMessage.toString('utf8');
  }

  async encryptKey(secretKey: Buffer) {
    const pemFile = await this.getServerPem();
    const encrypted = publicEncrypt(
      {
        key: pemFile,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      secretKey,
    );
    return encrypted;
  }

  decryptKey(privKey: string, data: Buffer) {
    const privLoad = createPrivateKey(privKey);
    const decrypted = privateDecrypt(
      {
        key: privLoad,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      data,
    );
    return decrypted;
  }

  finalizeData(buffs: Buffer[]) {
    const base64 = Buffer.concat(buffs).toString('base64');
    return `-----BEGIN ENCRYPTED MESSAGE-----\r\n${base64}\n-----END ENCRYPTED MESSAGE-----`;
  }

  async createPayload(payload: ISatusehatKycInitiateDto) {
    const aesKey = this.generateSecretKey();
    const ivKey = this.generateIV();
    const [publicKey, privateKey] = await this.getKeyPair();
    const unencrypted = SatusehatKycInitiateDto.create(payload, publicKey);
    const encryptedMessage = await this.encryptMessage(
      JSON.stringify(unencrypted),
      aesKey,
      ivKey,
    );
    return {
      encryptedData: this.finalizeData(encryptedMessage),
      privateKey: privateKey,
    };
  }

  async postKyc(payload: ISatusehatKycInitiateDto) {
    const config = await this._redisService.get(`Config:SatuSehat`, '.');
    const token = await this._redisService.get(
      `Auth:{SatuSehat}:${payload.hospital_id}`,
      '.',
    );
    const { encryptedData, privateKey } = await this.createPayload(payload);

    const { data, statusText } = await firstValueFrom(
      this._httpService
        .post(`${config.kyc_url}/generate-url`, encryptedData, {
          headers: {
            'Content-Type': 'text/plain',
            Authorization: `Bearer ${token.access_token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this._loggerService.elasticError(
              '/satu-sehat/kyc/generate-url',
              payload.hospital_id,
              payload,
              {
                error: true,
                message: error.message,
                data: error.response.data,
              },
            );
            throw error.message;
          }),
        ),
    );
    const decrypted = await this.decryptMessage(data, privateKey);
    const response = JSON.parse(decrypted);
    const parsedData = {
      ...response.data,
      created_at: this._datetimeService.getCurrentDatetime(),
      expired_at: token.expired_at,
    };
    await this._redisService.set(
      `SatusehatKYC:${payload.hospital_id}:${payload.employee_id}`,
      '$',
      parsedData,
    );
    this._loggerService.elasticInfo(
      '/satu-sehat/kyc/generate-url',
      payload.hospital_id,
      payload,
      {
        error: false,
        message: statusText,
        data: parsedData,
      },
    );
    return parsedData;
  }

  async getKyc(payload: IGetSatusehatKyc) {
    try {
      const exist = await this._redisService.get(
        `SatusehatKYC:${payload.hospital_id}:${payload.employee_id}`,
        '.',
      );
      if (exist) {
        const expiresIn = new Date(exist.expired_at);
        const currentTime = new Date();
        if (expiresIn.getTime() < currentTime.getTime()) {
          const data = await this.postKyc(payload);
          return data;
        } else {
          return exist;
        }
      } else {
        const data = await this.postKyc(payload);
        return data;
      }
    } catch (err) {
      throw err;
    }
  }
}

import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as winston from 'winston';

import { ConfigService } from './config.service';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly _logger: winston.Logger;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _elasticService: ElasticsearchService,
  ) {
    super(LoggerService.name, { timestamp: true });
    let winstonConfig: winston.LoggerOptions =
      this._configService.winstonConfig;

    if (this._configService.elastic.apm.enabled) {
      winstonConfig = {
        transports: [
          ...this._configService.winstonConfig.transports,
          this._elasticService.apmTransport,
        ],
        exitOnError: this._configService.winstonConfig.exitOnError,
      };
    }
    this._logger = winston.createLogger(winstonConfig);
    if (this._configService.nodeEnv !== 'production') {
      this._logger.debug('Logging initialiazed at debug level');
    }
  }
  log(message: string): void {
    this._logger.info(message);
  }
  info(message: string): void {
    this._logger.info(message);
  }
  debug(message: string): void {
    this._logger.debug(message);
  }
  error(message: string, trace?: any, context?: string): void {
    // i think the trace should be JSON Stringified
    this._logger.error(
      `${context || ''} ${message} -> (${trace || 'trace not provided !'})`,
    );
  }
  warn(message: string): void {
    this._logger.warn(message);
  }

  //Elastic Logger
  elasticInfo(
    message: string,
    branch: string,
    req: object,
    res: object,
    meta: any = {},
  ): void {
    this._logger.info(
      `${this._configService.elastic.apm.serviceName}${message}`,
      {
        ...meta,
        service_name: this._configService.elastic.apm.serviceName,
        branch,
        environment: this._configService.nodeEnv,
        request: JSON.stringify(req),
        response: JSON.stringify(res),
      },
    );
  }
  elasticError(
    message: string,
    branch: string,
    req: object,
    res: object,
    meta: any = {},
  ): void {
    this._logger.error(
      `${this._configService.elastic.apm.serviceName}${message}`,
      {
        ...meta,
        service_name: this._configService.elastic.apm.serviceName,
        branch,
        environment: this._configService.nodeEnv,
        request: JSON.stringify(req),
        response: JSON.stringify(res),
      },
    );
  }
}

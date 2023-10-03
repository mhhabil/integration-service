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
    let winstonConfig: winston.LoggerOptions = _configService.winstonConfig;

    if (_configService.elastic.apm.enabled) {
      winstonConfig = {
        transports: [
          ..._configService.winstonConfig.transports,
          _elasticService.apmTransport,
        ],
        exitOnError: _configService.winstonConfig.exitOnError,
      };
    }
    this._logger = winston.createLogger(winstonConfig);
    if (_configService.nodeEnv !== 'production') {
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
}

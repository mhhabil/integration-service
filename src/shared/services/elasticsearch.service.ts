import { Injectable } from '@nestjs/common';
import * as ElasticAgent from 'elastic-apm-node';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

import { ConfigService } from './config.service';

@Injectable()
export class ElasticsearchService {
  private readonly _apm: typeof ElasticAgent;
  private readonly _apmTransport: ElasticsearchTransport;
  private readonly _elasticClient: Client;

  constructor(private readonly _configService: ConfigService) {
    if (_configService.elastic.apm.enabled) {
      this._apm = ElasticAgent.start({
        // Override service name from package.json
        // Allowed characters: a-z, A-Z, 0-9, -, _, and space
        serviceName: this._configService.elastic.apm.serviceName,

        // Set custom APM Server URL (default: http://localhost:8200)
        serverUrl: this._configService.elastic.apm.serverUrl,

        // Use if APM Server uses API keys for authentication
        apiKey: this._configService.elastic.apm.apiKey,

        environment: this._configService.nodeEnv,

        active: this._configService.elastic.apm.enabled,
      });

      this._apmTransport = new ElasticsearchTransport({
        apm: this._apm,
        level: 'info',
        indexPrefix: `gic-logs-${this._configService.elastic.apm.serviceName}`,
        indexSuffixPattern: 'YYYY.MM',
        clientOpts: {
          cloud: {
            id: this._configService.elastic.search.cloudId,
          },
          auth: {
            apiKey: this._configService.elastic.search.apiKey,
          },
        },
      });
    }
    this._elasticClient = new Client({
      cloud: {
        id: this._configService.elastic.search.cloudId,
      },
      auth: {
        apiKey: this._configService.elastic.search.apiKey,
      },
    });
  }
  get apmTransport(): ElasticsearchTransport {
    return this._apmTransport;
  }

  get client(): Client {
    return this._elasticClient;
  }
}

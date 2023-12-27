import { Injectable } from '@nestjs/common';
import * as ElasticAgent from 'elastic-apm-node';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

import { ConfigService } from './config.service';
import { DatetimeService } from './datetime.service';

@Injectable()
export class ElasticsearchService {
  private readonly _apm: typeof ElasticAgent;
  private readonly _apmTransport: ElasticsearchTransport;
  private readonly _elasticClient: Client;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _datetimeService: DatetimeService,
  ) {
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

  async query(
    path: string,
    index: string,
    date: string,
    from: number,
    size: number,
  ) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    const startDate = this._datetimeService.getNormalDate(d);

    const result = await this.client.search({
      from,
      size,
      sort: [
        {
          '@timestamp': {
            order: 'desc',
            unmapped_type: 'boolean',
          },
        },
      ],
      query: {
        bool: {
          must: [],
          filter: [
            {
              bool: {
                filter: [
                  {
                    bool: {
                      should: [
                        {
                          match_phrase: {
                            _index: index,
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                  {
                    bool: {
                      should: [
                        {
                          match_phrase: {
                            message: `gic-integration${path}`,
                          },
                        },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                ],
              },
            },
            {
              range: {
                '@timestamp': {
                  format: 'strict_date_optional_time',
                  gte: `${startDate}T17:00:00.000Z`,
                  lte: `${date}T16:59:59.000Z`,
                },
              },
            },
          ],
        },
      },
    });
    return result;
  }
}

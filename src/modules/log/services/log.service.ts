import { Injectable } from '@nestjs/common';
import { LogDetail } from '../interfaces/log';
import { LogGetDto } from '../dtos/log-get.dto';
import { DatetimeService } from 'src/shared/services/datetime.service';
import { ElasticsearchService } from 'src/shared/services/elasticsearch.service';

@Injectable()
export class LogService {
  constructor(
    private readonly _datetimeService: DatetimeService,
    private readonly _elasticsearchService: ElasticsearchService,
  ) {}

  async findAll(query: LogGetDto) {
    const result = await this._elasticsearchService.query(
      query.path,
      query.index,
      query.date,
      query.branch,
      +query.from,
      +query.size,
    );
    const total =
      result.hits.total && !(typeof result.hits.total === 'number')
        ? result.hits.total.value
        : result.hits.total;
    const { hits } = result.hits;
    const records = hits.map((item) => {
      return LogDetail.create({
        timestamp: item._source['@timestamp']
          ? this._datetimeService.getLocalDatetime(item._source['@timestamp'])
          : '',
        branch: item._source['fields']['branch'],
        treatment: item._source['fields']['encounter'],
        status:
          item._source['severity'] && item._source['severity'] === 'info'
            ? 'success'
            : 'error',
      });
    });

    return {
      total,
      records,
    };
  }
}

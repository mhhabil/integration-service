import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { ElasticsearchService } from 'src/shared/services/elasticsearch.service';
import { LogGetDto } from '../dtos/log-get.dto';

@Controller('log')
@ApiTags('Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private _elasticsearchService: ElasticsearchService) {}

  @ApiOperation({ summary: 'Get Company' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Company Found' })
  @Get()
  async findAll(@Query() query: LogGetDto, @Res() res: Response) {
    const result = await this._elasticsearchService.query(
      query.path,
      query.index,
      query.date,
      +query.from,
      +query.size,
    );
    const total =
      result.hits.total && !(typeof result.hits.total === 'number')
        ? result.hits.total.value
        : result.hits.total;
    const { hits } = result.hits;
    res.status(HttpStatus.OK).json({
      error: false,
      total,
      filtered: hits.length,
      records: hits,
    });
  }
}

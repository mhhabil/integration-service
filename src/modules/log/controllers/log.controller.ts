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
import { LogGetDto } from '../dtos/log-get.dto';
import { LogService } from '../services/log.service';

@Controller('log')
@ApiTags('Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private _logService: LogService) {}

  @ApiOperation({ summary: 'Get Logs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logs Found' })
  @Get()
  async findAll(@Query() query: LogGetDto, @Res() res: Response) {
    const { records, total } = await this._logService.findAll(query);
    res.status(HttpStatus.OK).json({
      error: false,
      total,
      filtered: records.length,
      records: records,
    });
  }
}

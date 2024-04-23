import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { CloudSchedulerService } from '../services/cloud-scheduler.service';
import { Request, Response } from 'express';
import { LoggerService } from 'src/shared/services/logger.service';
import * as moment from 'moment';

@Controller('cloud-scheduler')
export class CloudSchedulerController {
  constructor(
    private readonly _cloudSchedulerService: CloudSchedulerService,
    private readonly _loggerService: LoggerService,
  ) {}

  @Get('satusehat')
  async getSatusehat(@Req() req: Request, @Res() res: Response) {
    if (req.headers['user-agent'] === 'Google-Cloud-Scheduler') {
      await this._cloudSchedulerService.getSatusehat();
      res.status(HttpStatus.CREATED).json({
        error: false,
        message: 'OK',
      });
    } else {
      this._loggerService.elasticError(
        '/cloud-scheduler/get-token',
        'INVALID USER AGENT',
        {
          timestamp: moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss'),
        },
        { error: 'Invalid User Agent' },
      );
      res.status(HttpStatus.FORBIDDEN).json({
        error: true,
        message: 'Invalid User Agent',
      });
    }
  }
}

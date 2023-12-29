import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { CloudSchedulerService } from '../services/cloud-scheduler.service';
import { Request, Response } from 'express';

@Controller('cloud-scheduler')
export class CloudSchedulerController {
  constructor(private readonly _cloudSchedulerService: CloudSchedulerService) {}

  @Get('satusehat')
  async getSatusehat(@Req() req: Request, @Res() res: Response) {
    await this._cloudSchedulerService.getSatusehat();
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }
}

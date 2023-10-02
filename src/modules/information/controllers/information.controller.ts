import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InformationCreateDto } from '../dtos/information-create.dto';
import { InformationService } from '../services/information.service';
import { Request, Response } from 'express';
import { IJWTUser } from 'src/auth/jwt-payload.interface';

@Controller('information')
@UseGuards(JwtAuthGuard)
export class InformationController {
  constructor(private informationService: InformationService) {}

  @Post()
  async create(
    @Body() payload: InformationCreateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IJWTUser = req.user as any;
    const userId = user.id;
    await this.informationService.create(payload, userId);
    res.status(HttpStatus.CREATED).json({
      message: 'OK',
    });
  }

  @Get()
  async findById(
    @Query('hospital_id') hospital_id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.informationService.findById(hospital_id);
    if (result) {
      res.status(HttpStatus.OK).json({
        data: result,
        message: 'OK',
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'Data tidak ditemukan',
      });
    }
  }
}

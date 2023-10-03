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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InformationCreateDto } from '../dtos/information-create.dto';
import { InformationService } from '../services/information.service';
import { Request, Response } from 'express';
import { IJWTUser } from 'src/auth/jwt-payload.interface';

@Controller('information')
@ApiTags('Information')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InformationController {
  constructor(private informationService: InformationService) {}

  @ApiOperation({ summary: 'Create Information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Information Created' })
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

  @ApiOperation({ summary: 'Get Information' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Information Found' })
  @ApiQuery({ name: 'hospital_id', required: true })
  @ApiQuery({ name: 'type_id', required: true })
  @Get()
  async findById(
    @Query('hospital_id') hospital_id: string,
    @Query('type_id') type_id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.informationService.findById(hospital_id, type_id);
    if (result) {
      res.status(HttpStatus.FOUND).json({
        data: result,
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'Data tidak ditemukan',
      });
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpStatus,
  Req,
  Res,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InformationService } from '../services/information.service';
import { Request, Response } from 'express';

@Controller('information')
@ApiTags('Information')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InformationController {
  constructor(private informationService: InformationService) {}

  @ApiOperation({ summary: 'Create Information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Information Created' })
  @Post(':type_id')
  async create(
    @Param() params: { type_id: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.informationService.create(req, params.type_id);
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @ApiOperation({ summary: 'Get Information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Information Found' })
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
      res.status(HttpStatus.OK).json({
        error: false,
        data: result,
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        error: true,
        message: 'Data not found',
      });
    }
  }
}

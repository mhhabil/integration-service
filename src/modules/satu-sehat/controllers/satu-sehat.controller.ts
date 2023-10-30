import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpStatus,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { SatuSehatService } from '../services/satu-sehat.service';
import { SatuSehatInformationDto } from '../dtos/satu-sehat-information-create.dto';
import { IJWTUser } from 'src/auth/jwt-payload.interface';

@Controller('satu-sehat')
@ApiTags('SatuSehat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SatuSehatController {
  constructor(private satusehatService: SatuSehatService) {}

  @ApiOperation({ summary: 'Create SatuSehat Information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SatuSehat Information Created',
  })
  @Post('info')
  async createInformation(
    @Body() payload: SatuSehatInformationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IJWTUser = req.user as any;
    const userId = user.id;
    await this.satusehatService.informationCreate(payload, userId);
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @ApiOperation({ summary: 'Get SatuSehat Information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Information Found' })
  @ApiQuery({ name: 'hospital_id', required: true })
  @Get('info')
  async findInformationById(
    @Query('hospital_id') hospital_id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.satusehatService.findInformationById(hospital_id);
    if (result) {
      res.status(HttpStatus.OK).json({
        error: false,
        data: result,
      });
    } else {
      res.status(HttpStatus.OK).json({
        error: false,
        data: {
          type_id: 'satusehat',
        },
      });
    }
  }
}

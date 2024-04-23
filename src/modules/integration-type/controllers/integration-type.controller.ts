import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IntegrationTypeCreateDto } from '../dtos/integration-type.dto';
import { IntegrationTypeService } from '../services/integration-type.service';
import { IJWTUser } from 'src/auth/jwt-payload.interface';
import { Request, Response } from 'express';

@Controller('integration-type')
@ApiTags('Integration Type')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class IntegrationTypeController {
  constructor(private integrationTypeService: IntegrationTypeService) {}

  @ApiOperation({ summary: 'Create Integration Type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Integration Type Created',
  })
  @Post()
  async create(
    @Body() payload: IntegrationTypeCreateDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IJWTUser = req.user as any;
    const userId = user.id;
    await this.integrationTypeService.create(payload, userId);
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @ApiOperation({ summary: 'Get Integration Type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Integration Type Found' })
  @Get()
  async findAll(@Res() res: Response): Promise<void> {
    const result = await this.integrationTypeService.findAll();
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

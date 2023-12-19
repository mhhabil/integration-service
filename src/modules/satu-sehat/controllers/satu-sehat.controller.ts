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
import { ISatuSehatOrganizationCreateDto } from '../dtos/satu-sehat-organization-create.dto';
import { ISatuSehatLocationCreateDto } from '../dtos/satu-sehat-location-create.dto';
import { LoggerService } from 'src/shared/services/logger.service';
import { SatusehatBundleGetDto } from '../dtos/satu-sehat-bundle-get.dto';

@Controller('satu-sehat')
@ApiTags('SatuSehat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SatuSehatController {
  constructor(
    private satusehatService: SatuSehatService,
    private _loggerService: LoggerService,
  ) {}

  @Get('status')
  async getStatus(
    @Query('hospital_id') hospital_id: string,
    @Res() res: Response,
  ) {
    const status = await this.satusehatService.findStatus(hospital_id);
    res.status(HttpStatus.OK).json({
      error: false,
      message: 'OK',
      status,
    });
  }

  @ApiOperation({ summary: 'Get Practitioner By NIK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Practitioner Found' })
  @ApiQuery({ name: 'hospital_id', required: true })
  @ApiQuery({ name: 'nik', required: true })
  @Get('practitioner')
  async getPractitioner(
    @Query('hospital_id') hospital_id: string,
    @Query('nik') nik: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.satusehatService.findPractitionerByNIK(
      hospital_id,
      nik,
    );
    if (result) {
      res.status(HttpStatus.OK).json({
        error: false,
        message: 'OK',
        data: result,
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        error: true,
        message: 'Data not found',
        data: {},
      });
    }
  }

  @ApiOperation({ summary: 'Get Patient By NIK' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Patient Found' })
  @ApiQuery({ name: 'hospital_id', required: true })
  @ApiQuery({ name: 'nik', required: true })
  @Get('patient')
  async getPatient(
    @Query('hospital_id') hospital_id: string,
    @Query('nik') nik: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.satusehatService.findPatientByNIK(
      hospital_id,
      nik,
    );
    if (result) {
      res.status(HttpStatus.OK).json({
        error: false,
        message: 'OK',
        data: result,
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        error: true,
        message: 'Data not found',
        data: {},
      });
    }
  }

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
    this._loggerService.elasticInfo(req.path, payload.hospital_id, req.body, {
      error: false,
      message: 'OK',
    });
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

  @Get('organization')
  async findOrganizationById(
    @Query('hospital_id') hospital_id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result =
      await this.satusehatService.findOrganizationById(hospital_id);
    res.status(HttpStatus.OK).json({
      error: false,
      data: result ?? [],
    });
  }

  @ApiOperation({ summary: 'Create Organization' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SatuSehat Organization Created',
  })
  @Post('organization')
  async createOrganization(
    @Body() payload: ISatuSehatOrganizationCreateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.satusehatService.createOrganization({
      ...payload,
      hospital_id: req.query.hospital_id as string,
    });
    this._loggerService.elasticInfo(req.path, payload.hospital_id, payload, {
      error: false,
      message: 'OK',
    });
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @Get('location')
  async findLocationById(
    @Query('hospital_id') hospital_id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.satusehatService.findLocationById(hospital_id);
    res.status(HttpStatus.OK).json({
      error: false,
      data: result ?? [],
    });
  }

  @ApiOperation({ summary: 'Create Location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SatuSehat Location Created',
  })
  @Post('location')
  async createLocation(
    @Body() payload: ISatuSehatLocationCreateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.satusehatService.createLocation({
      ...payload,
      hospital_id: req.query.hospital_id as string,
    });
    this._loggerService.elasticInfo(req.path, payload.hospital_id, payload, {
      error: false,
      message: 'OK',
    });
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @ApiOperation({ summary: 'POST To Satusehat Bundle Encounter & Condition' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POST To Satusehat Bundle Encounter & Condition',
  })
  @Get('bundle')
  async postBundles(
    @Query() payload: SatusehatBundleGetDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IJWTUser = req.user as any;
    await this.satusehatService.postBundlesByDate(
      payload.date,
      payload.type,
      user,
    );
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }
}

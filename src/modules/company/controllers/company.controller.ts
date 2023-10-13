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
import { CompanyCreateDto } from '../dtos/company-create.dto';
import { CompanyService } from '../services/company.service';
import { IJWTUser } from 'src/auth/jwt-payload.interface';
import { Request, Response } from 'express';

@Controller('company')
@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @ApiOperation({ summary: 'Create Company' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Company Created' })
  @Post()
  async create(
    @Body() payload: CompanyCreateDto[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: IJWTUser = req.user as any;
    const userId = user.id;
    await this.companyService.create(payload, userId);
    res.status(HttpStatus.CREATED).json({
      error: false,
      message: 'OK',
    });
  }

  @ApiOperation({ summary: 'Get Company' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Company Found' })
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.companyService.findAll();
    const user: IJWTUser = req.user as any;
    const companyList = await user.service.getCompanies(user.id);
    if (result) {
      const authorizedCompanies = result.companies.filter((company) =>
        companyList.includes(company.code),
      );
      res.status(HttpStatus.OK).json({
        error: false,
        data: {
          ...result,
          companies: authorizedCompanies,
        },
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({
        error: true,
        message: 'Data not found',
      });
    }
  }
}

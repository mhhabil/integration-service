import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InformationCreateDto } from '../dtos/information-create.dto';
import { InformationService } from '../services/information.service';
import { Information } from '../interfaces/information';

@Controller('information')
export class InformationController {
  constructor(private informationService: InformationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() payload: InformationCreateDto) {
    this.informationService.create(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('hospital_id') hospital_id: string,
  ): Promise<Information> {
    return this.informationService.findAll(hospital_id);
  }
}

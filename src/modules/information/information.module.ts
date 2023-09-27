import { Module } from '@nestjs/common';
import { InformationController } from './controllers/information.controller';
import { InformationService } from './services/information.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [InformationController],
  providers: [InformationService],
})
export class InformationModule {}

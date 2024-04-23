import { Module } from '@nestjs/common';
import { IntegrationTypeController } from './controllers/integration-type.controller';
import { IntegrationTypeService } from './services/integration-type.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [IntegrationTypeController],
  providers: [IntegrationTypeService],
})
export class IntegrationTypeModule {}

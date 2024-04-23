import { Module } from '@nestjs/common';
import { CloudSchedulerController } from './controllers/cloud-scheduler.controller';
import { CloudSchedulerService } from './services/cloud-scheduler.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CloudSchedulerController],
  providers: [CloudSchedulerService],
})
export class CloudSchedulerModule {}

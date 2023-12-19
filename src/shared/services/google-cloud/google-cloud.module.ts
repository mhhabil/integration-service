import { Module } from '@nestjs/common';
import { CloudTasksService } from './services/cloud-tasks.service';
import { CloudTasksClient } from '@google-cloud/tasks';
const providers = [CloudTasksService, CloudTasksClient];

@Module({
  providers,
  exports: [...providers],
})
export class GoogleCloudModule {}

import { Injectable } from '@nestjs/common';
import { CloudTasksClient } from '@google-cloud/tasks';
import { ConfigService } from '../../config.service';
import { google } from '@google-cloud/tasks/build/protos/protos';

@Injectable()
export class CloudTasksService {
  constructor(
    private cloudTasksClient: CloudTasksClient = new CloudTasksClient(),
    private configService: ConfigService,
  ) {}

  getParent() {
    return this.cloudTasksClient.queuePath(
      this.configService.googleCloud.projectId,
      this.configService.googleCloud.location,
      this.configService.googleCloud.taskQueueName,
    );
  }

  async createTask(task: google.cloud.tasks.v2.ITask) {
    await this.cloudTasksClient.createTask({ parent: this.getParent(), task });
  }
}

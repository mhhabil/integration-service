import { Test, TestingModule } from '@nestjs/testing';
import { CloudSchedulerController } from './cloud-scheduler.controller';

describe('CloudSchedulerController', () => {
  let controller: CloudSchedulerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudSchedulerController],
    }).compile();

    controller = module.get<CloudSchedulerController>(CloudSchedulerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CloudSchedulerService } from './cloud-scheduler.service';

describe('CloudSchedulerService', () => {
  let service: CloudSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudSchedulerService],
    }).compile();

    service = module.get<CloudSchedulerService>(CloudSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

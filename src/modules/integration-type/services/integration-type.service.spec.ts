import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationTypeService } from './integration-type.service';

describe('IntegrationTypeService', () => {
  let service: IntegrationTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationTypeService],
    }).compile();

    service = module.get<IntegrationTypeService>(IntegrationTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SatuSehatService } from './satu-sehat.service';

describe('SatuSehatService', () => {
  let service: SatuSehatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatuSehatService],
    }).compile();

    service = module.get<SatuSehatService>(SatuSehatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

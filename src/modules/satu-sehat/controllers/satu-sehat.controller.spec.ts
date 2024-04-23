import { Test, TestingModule } from '@nestjs/testing';
import { SatuSehatController } from './satu-sehat.controller';

describe('SatuSehatController', () => {
  let controller: SatuSehatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatuSehatController],
    }).compile();

    controller = module.get<SatuSehatController>(SatuSehatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

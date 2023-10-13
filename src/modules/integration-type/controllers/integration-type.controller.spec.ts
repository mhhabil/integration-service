import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationTypeController } from '../controllers/integration-type.controller';

describe('IntegrationTypeController', () => {
  let controller: IntegrationTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationTypeController],
    }).compile();

    controller = module.get<IntegrationTypeController>(
      IntegrationTypeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

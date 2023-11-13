import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { SatuSehatController } from './controllers/satu-sehat.controller';
import { SatuSehatService } from './services/satu-sehat.service';
import { SatuSehatMiddleware } from 'src/middlewares/satusehat/satusehat.middleware';
import { ExternalSatuSehatModule } from 'src/shared/services/satusehat/external.satusehat.module';

@Module({
  imports: [SharedModule, ExternalSatuSehatModule],
  controllers: [SatuSehatController],
  providers: [SatuSehatService],
})
export class SatuSehatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SatuSehatMiddleware)
      .exclude(
        { path: 'satu-sehat/info', method: RequestMethod.GET },
        { path: 'satu-sehat/info', method: RequestMethod.POST },
      )
      .forRoutes(SatuSehatController);
  }
}

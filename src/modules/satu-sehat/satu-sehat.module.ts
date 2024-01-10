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
import { SatusehatTypeService } from './services/satu-sehat-type.service';
import { SatusehatAuthService } from './services/satu-sehat-get-token';
import { CloudTasksService } from 'src/shared/services/google-cloud/services/cloud-tasks.service';
import { GoogleCloudModule } from 'src/shared/services/google-cloud/google-cloud.module';
import { SatusehatKYC } from './services/satu-sehat-kyc';

@Module({
  imports: [SharedModule, ExternalSatuSehatModule, GoogleCloudModule],
  controllers: [SatuSehatController],
  providers: [
    SatuSehatService,
    SatusehatTypeService,
    SatusehatAuthService,
    SatusehatKYC,
    CloudTasksService,
  ],
})
export class SatuSehatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SatuSehatMiddleware)
      .exclude(
        { path: 'satu-sehat/info', method: RequestMethod.GET },
        { path: 'satu-sehat/info', method: RequestMethod.POST },
        { path: 'satu-sehat/status', method: RequestMethod.GET },
        { path: 'satu-sehat/bundle', method: RequestMethod.GET },
        { path: 'satu-sehat/simrs', method: RequestMethod.GET },
        { path: 'satu-sehat/company', method: RequestMethod.GET },
        { path: 'satu-sehat/data', method: RequestMethod.POST },
      )
      .forRoutes(SatuSehatController);
  }
}

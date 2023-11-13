import { ExternalSatuSehatService } from './external.satusehat.service';
import { Module } from '@nestjs/common';
const providers = [ExternalSatuSehatService];

@Module({
  providers,
  exports: [...providers],
})
export class ExternalSatuSehatModule {}

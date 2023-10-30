import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { SatuSehatController } from './controllers/satu-sehat.controller';
import { SatuSehatService } from './services/satu-sehat.service';

@Module({
  imports: [SharedModule],
  controllers: [SatuSehatController],
  providers: [SatuSehatService],
})
export class SatuSehatModule {}

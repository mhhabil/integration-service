import { Module } from '@nestjs/common';
import { LogService } from './services/log.service';
import { SharedModule } from 'src/shared/shared.module';
import { LogController } from './controllers/log.controller';

@Module({
  imports: [SharedModule],
  controllers: [LogController],
  providers: [LogService],
})
export class LogModule {}

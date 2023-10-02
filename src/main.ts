import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { setupSwagger } from './shared/swagger/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const configService = app.select(SharedModule).get(ConfigService);
  setupSwagger(app, configService.swaggerConfig);
}
bootstrap();

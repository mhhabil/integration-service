import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { setupSwagger } from './shared/swagger/setup';
// import whitelist from './shared/whitelist';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3412);

  const configService = app.select(SharedModule).get(ConfigService);
  setupSwagger(app, configService.swaggerConfig);
}
bootstrap();

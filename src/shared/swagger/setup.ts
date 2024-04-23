import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { ISwaggerConfigInterface } from '../../interfaces/swagger-config.interface';

export function setupSwagger(
  app: INestApplication,
  config: ISwaggerConfigInterface,
) {
  const documentOptions = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth()
    .addServer(`${config.scheme}://`)
    .build();

  const customOptions: SwaggerCustomOptions = {};

  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup(config.path, app, document, customOptions);
}

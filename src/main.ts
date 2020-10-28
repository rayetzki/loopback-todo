import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const options = new DocumentBuilder()
    .setTitle('Recipes API')
    .setDescription('An API to register and add recipes')
    .setVersion('1.0')
    .addTag('recipes')
    .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
    )
    .build();

(async () => {
    const app: INestApplication = await NestFactory.create(AppModule, { cors: true });
    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
    app.setGlobalPrefix('api');
    SwaggerModule.setup('swagger', app, document);
    await app.listen(3000);
})();

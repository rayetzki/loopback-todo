import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

(async () => {
    const app: INestApplication = await NestFactory.create(AppModule, { cors: true });
    app.setGlobalPrefix('api');

    const options = new DocumentBuilder()
        .setTitle('Recipes API')
        .setDescription('An API to register and add recipes')
        .setVersion('1.0')
        .addTag('recipes')
        .addBearerAuth()
        .setBasePath('api')
        .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);
    await app.listen(3000);
})();

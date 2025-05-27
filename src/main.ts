import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('D.I.S.C.')
    .setDescription(
      "The DISC project is a personality test designed to analyze individuals' behavior and traits in a professional context, aiming to assess adaptability, behavioral preferences, and stress response.",
    )
    .setVersion('1.0')
    .setExternalDoc(
      'Github repository',
      'https://github.com/anthonyrovira/disc-backend',
    )
    .addSecurity('bearer', {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Write "bearer " then the token',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'disc.json',
  });

  await app.listen(3001);
}
bootstrap();

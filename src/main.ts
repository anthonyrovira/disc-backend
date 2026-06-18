import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => {
        const formatted = errors.map((e) => ({
          field: e.property,
          message: Object.values(e.constraints ?? {}).join(', '),
        }));
        return new BadRequestException({ errors: formatted });
      },
    }),
  );

  const config = new DocumentBuilder()
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

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api/json',
  });

  await app.listen(3001);
}
bootstrap();

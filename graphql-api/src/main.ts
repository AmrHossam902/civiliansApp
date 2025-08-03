import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    cors: { 
      origin: [
        process.env.PUBLIC_URL as string, 
        process.env.FRONTEND_INTERNAL_URL as string,
      ]
    } 
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

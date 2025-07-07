import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    cors: { 
      origin: [
        process.env.PUBLIC_FRONTEND_URL as string, 
        process.env.FRONT_URL as string,
      ]
    } 
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

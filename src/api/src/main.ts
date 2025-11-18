import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

process.env.TZ = 'Europe/Moscow'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logRequests } from './background/log_requests';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');

    logRequests()

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

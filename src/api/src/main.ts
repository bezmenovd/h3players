import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TimingInterceptor } from './interceptors/timing';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new TimingInterceptor())

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

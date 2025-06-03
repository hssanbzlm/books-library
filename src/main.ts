import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: true });
  app.useGlobalFilters(new HttpExceptionFilter());

  // I added this to be able to run microservice with monolotith app
  // otherwise, I need to run the microservice manually: npm run start:book-service
  // also I added the bookModule (microservice running in 3001) to appModule otherwise this method
  // will not work
  const bookMicroservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });
  const authMicroservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3002 },
  });
  const userMicroservice = app.connectMicroservice({
    tranport: Transport.TCP,
    options: { host: 'localhost', port: 3003 },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();

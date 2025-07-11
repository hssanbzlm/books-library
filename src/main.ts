import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const adapter = new ExpressAdapter();
  adapter.set('trust proxy', 1);

  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    credentials: true,
    origin: 'https://books-library-front.vercel.app',
  });

  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 1 }));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

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
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3003 },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

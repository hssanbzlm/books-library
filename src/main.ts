import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from "graphql-upload";
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: true });
  app.use(graphqlUploadExpress({maxFileSize: 1000000, maxFiles: 1}))
  app.useGlobalPipes(new ValidationPipe({transform:true,whitelist:true}))
  await app.listen(3000);
}
bootstrap();

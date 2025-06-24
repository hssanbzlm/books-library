import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UserModule, {
    transport: Transport.TCP,
    name: 'USER_SERVICE',
    options: {
      host: 'localhost',
      port: 3003,
    },
  });
  await app.listen()
}
bootstrap();

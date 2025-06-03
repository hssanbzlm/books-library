import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthModule, {
    transport: Transport.TCP,
    name: 'AUTH_SERVICE',
    options: { host: 'localhost', port: 3002 },
  });
  await app.listen();
}
bootstrap();

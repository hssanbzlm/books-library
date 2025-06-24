import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { BookModule } from "./book.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BookModule, {
    transport: Transport.TCP,
    name:'BOOK_SERVICE',
    options: { host: 'localhost', port: 3001 },
  });
  await app.listen();
}
bootstrap();

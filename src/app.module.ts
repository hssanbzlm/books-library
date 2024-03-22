import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { APP_PIPE } from '@nestjs/core';
import { AuthorModule } from './author/author.module';
import { Author } from './author/entities/author.entity';
import { BookModule } from './book/book.module';
import { Book } from './book/entities/book.entity';
const cookieSession = require('cookie-session');
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        port: config.get<number>('DB_PORT'),
        entities: [User, Author, Book],
        synchronize: true,
      }),
    }),
    AuthorModule,
    BookModule,
  ],
  providers: [
    {
      // Vliadation pipe use the magic of class validators(@IsString,@IsEmail)
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({ keys: [this.configService.get('COOKIE_KEY')] }))
      .forRoutes('*');
  }
}

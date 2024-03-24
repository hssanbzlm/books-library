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
import { UserToBook } from './book/entities/userToBook';
import { CurrentUserMiddleware } from './middlewares/current-user/current-user.middleware';
import { BorrowReminderService } from './tasks/borrow-reminder/borrow-reminder.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { BookService } from './book/book.service';
const cookieSession = require('cookie-session');
@Module({
  imports: [
    AuthModule,
    AuthorModule,
    BookModule,
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
        entities: [User, Author, Book, UserToBook],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User, Book, Author, UserToBook]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'Gmail',
          tls: { rejectUnauthorized: false },
          auth: {
            user: config.get<string>('EMAIL_REMINDER'),
            pass: config.get<string>('EMAIL_REMINDER_PASSWORD'),
          },
        },
      }),
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      // Vliadation pipe use the magic of class validators(@IsString,@IsEmail)
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    BorrowReminderService,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({ keys: [this.configService.get('COOKIE_KEY')] }))
      .forRoutes('*');
    consumer.apply(CurrentUserMiddleware).forRoutes('book');
  }
}

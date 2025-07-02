import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { UserToBook } from './entities/userToBook';
import { User } from 'src/common/entities/user.entity';
import { BorrowReminderService } from 'src/tasks/borrow-reminder/borrow-reminder.service';
import { UserToBookService } from './user-to-book.service';
import { UserToBookController } from './user-to-book.contoller';
import { HttpModule } from '@nestjs/axios';
import { BookRecommendService } from './book-recommend.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
    NotificationsModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const dbUrl = config.get<string>('DATABASE_URL');
        return isProd && dbUrl
          ? {
              type: 'postgres',
              url: dbUrl,
              ssl: { rejectUnauthorized: false },
              autoLoadEntities: true,
              synchronize: false,
              entities: [User, Book, UserToBook, Notification],
            }
          : {
              type: 'postgres',
              port: config.get<number>('DB_PORT'),
              username: config.get<string>('DB_USERNAME'),
              password: config.get<string>('DB_PASSWORD'),
              entities: [User, Book, UserToBook, Notification],
              synchronize: true,
            };
      },
    }),
    TypeOrmModule.forFeature([Book, User, UserToBook,Notification]),
    HttpModule,
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
  ],
  controllers: [BookController, UserToBookController],
  providers: [
    BookService,
    BorrowReminderService,
    UserToBookService,
    BookRecommendService,
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return cloudinary.config({
          cloud_name: config.get<string>('CLOUDINARY_NAME'),
          api_key: config.get<string>('CLOUDINARY_API_KEY'),
          api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
        });
      },
    },
  ],
})
export class BookModule {}

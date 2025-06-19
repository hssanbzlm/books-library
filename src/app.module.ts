import {
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { BookModule } from './book/book.module';
import { Book } from './book/entities/book.entity';
import { UserToBook } from './book/entities/userToBook';
import { CurrentUserMiddleware } from './middlewares/current-user/current-user.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { Notification } from './notifications/entities/notification.entity';
import { RedisModule } from './redis/redis.module';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    UserModule,
    BookModule,
    EventEmitterModule.forRoot(),
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
        entities: [User, Book, UserToBook,Notification],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User, Book, UserToBook,Notification]),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      driver: ApolloDriver,
    }),
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
    NotificationsModule,
    RedisModule,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({ keys: [this.configService.get('COOKIE_KEY')] }))
      .forRoutes('*');

    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}

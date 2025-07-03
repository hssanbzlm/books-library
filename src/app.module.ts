import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './common/entities/user.entity';
import { APP_PIPE } from '@nestjs/core';
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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { BookModule } from './book/book.module';
import { AuthModule } from './auth/auth.module';
import { UserResolver } from './user/user.resolver';
import { BookResolver } from './book/book.resolver';
import { AuthResolver } from './user/auth.resolver';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BOOK_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 },
      },
    ]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 },
      },
    ]),
    UserModule,
    BookModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : undefined,
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
    TypeOrmModule.forFeature([User, Book, UserToBook, Notification]),
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
  ],
  controllers: [AppController],
  providers: [UserResolver, BookResolver, AuthResolver, AppService],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    console.log('cookie key ', this.configService.get('COOKIE_KEY'))
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
          sameSite: 'none',
          secure: true,
          httpOnly: true,
        }),
        CurrentUserMiddleware,
      )
      .forRoutes('*');
  }
}

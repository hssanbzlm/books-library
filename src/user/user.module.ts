import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Book } from 'src/book/entities/book.entity';
import { UserToBook } from 'src/book/entities/userToBook';
import { Notification } from '../notifications/entities/notification.entity';
@Module({
  imports: [
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
    TypeOrmModule.forFeature([User, Notification]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

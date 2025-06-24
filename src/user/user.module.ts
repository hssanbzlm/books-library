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
    TypeOrmModule.forFeature([User,Notification]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

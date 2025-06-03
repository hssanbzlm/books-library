import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/book/entities/book.entity';
import { UserToBook } from 'src/book/entities/userToBook';
import { User } from 'src/common/entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  providers: [AuthService],
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
        entities: [User, Book, UserToBook],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User]),
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
  controllers: [AuthController],
})
export class AuthModule {}

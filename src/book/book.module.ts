import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { UserToBook } from './entities/userToBook';
import { User } from 'src/user/entities/user.entity';
import { BorrowReminderService } from 'src/tasks/borrow-reminder/borrow-reminder.service';
import { UserToBookService } from './user-to-book.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserToBookController } from './user-to-book.contoller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, User, UserToBook]),
    CloudinaryModule,
    HttpModule,
  ],
  controllers: [BookController, UserToBookController],
  providers: [
    BookService,
    BorrowReminderService,
    UserToBookService,
  ],
})
export class BookModule {}

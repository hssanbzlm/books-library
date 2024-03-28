import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Author } from 'src/author/entities/author.entity';
import { UserToBook } from './entities/userToBook';
import { User } from 'src/auth/entities/user.entity';
import { BorrowReminderService } from 'src/tasks/borrow-reminder/borrow-reminder.service';
import { UserToBookService } from './user-to-book/user-to-book.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author, User, UserToBook]),
    CloudinaryModule,
  ],
  controllers: [BookController],
  providers: [BookService, BorrowReminderService, UserToBookService],
  exports: [BookService, UserToBookService],
})
export class BookModule {}

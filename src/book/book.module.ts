import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Author } from 'src/author/entities/author.entity';
import { UserToBook } from './entities/userToBook';
import { User } from 'src/auth/entities/user.entity';
import { BorrowReminderService } from 'src/tasks/borrow-reminder/borrow-reminder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, User, UserToBook])],
  controllers: [BookController],
  providers: [BookService, BorrowReminderService],
  exports: [BookService],
})
export class BookModule {}

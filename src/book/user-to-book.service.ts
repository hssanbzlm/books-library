import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserToBook,
  status as borrowStatus,
  statusState,
} from './entities/userToBook';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { User } from 'src/user/entities/user.entity';
import * as moment from 'moment';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserToBookService {
  constructor(
    @InjectRepository(UserToBook)
    private userToBookRepo: Repository<UserToBook>,
    @InjectRepository(Book) private bookReposistory: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async isBorrowed(userId: number, bookId: number) {
    const book = this.userToBookRepo
      .createQueryBuilder('usertobook')
      .where('usertobook.userId = :userId', { userId })
      .andWhere('usertobook.bookId = :bookId', { bookId })
      .andWhere('status IN (:...status)', {
        status: [
          borrowStatus.Pending,
          borrowStatus.Accepted,
          borrowStatus.Overdue,
          borrowStatus.CheckedOut,
        ],
      })
      .getOne();
    return book;
  }

  async updateBorrowStatus(borrowId: number, status: statusState) {
    const userToBook = await this.userToBookRepo.findOneBy({
      userToBookId: borrowId,
    });
    if (!userToBook) {
      throw new NotFoundException('check details');
    }
    if (userToBook.status != status) {
      await this.bookReposistory.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.update(
            UserToBook,
            { userToBookId: userToBook.userToBookId },
            { ...userToBook, status },
          );
          if (
            status == borrowStatus.Damaged ||
            status == borrowStatus.Returned ||
            status == borrowStatus.Refused
          )
            await transactionalEntityManager.increment(
              Book,
              { id: userToBook.bookId },
              'quantity',
              1,
            );
        },
      );
    } else return 'same status';
  }

  async borrow(
    { idBook, startDate, endDate }: BorrowBookDto,
    currentUser: User,
  ) {
    const isBorrowed = await this.isBorrowed(currentUser.id, idBook);
    if (isBorrowed) {
      throw new BadRequestException(
        `This book is already in ${isBorrowed.status} state`,
      );
    }
    const book = await this.bookReposistory.findOne({ where: { id: idBook } });
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });
    if (book && book.quantity > 0 && user) {
      await this.bookReposistory.manager.transaction(
        async (transactionalEntityManager) => {
          const detailBorrow = transactionalEntityManager.create(UserToBook, {
            bookId: idBook,
            userId: currentUser.id,
            startDate,
            endDate,
            status: borrowStatus.Pending,
          });
          await transactionalEntityManager.save(UserToBook, {
            ...detailBorrow,
            book,
            user,
          });
          await transactionalEntityManager.update(
            Book,
            { id: idBook },
            { ...book, quantity: book.quantity - 1 },
          );
        },
      );
    } else throw new NotFoundException('Resources not found');
    return book;
  }
  async borrowList() {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const queryResult: [] = await this.userRepository
      .createQueryBuilder('userRepo')
      .innerJoin('userRepo.userToBooks', 'userToBook')
      .where('userToBook.endDate = :thisDate', {
        thisDate: moment(nextDay).format('MM/DD/YYYY'),
      })
      .innerJoinAndSelect('userToBook.book', 'book')
      .select('userRepo.email', 'email')
      .addSelect('book.title', 'title')
      .execute();

    return this.groupBooks(queryResult);
  }
  private groupBooks(borrowList: { email: string; title: string }[]) {
    const booksByEmail = borrowList.reduce((acc, current) => {
      if (!acc[current.email]) {
        acc[current.email] = [];
      }
      acc[current.email].push(current.title);
      return acc;
    }, {});
    return booksByEmail;
  }

  async getBorrowList(userId?: number) {
    const userToBook = await this.userToBookRepo.find({
      where: userId && { userId },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        user: {
          id: true,
          email: true,
          name: true,
          lastName: true,
        },
        book: {
          id: true,
          title: true,
        },
      },
    });

    return instanceToPlain(userToBook);
  }
}

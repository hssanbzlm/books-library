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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserBorrowDto } from './dto/update-user-borrow.dto';
import { CancelBorrowDto } from './dto/cancel-borrow.dto';

@Injectable()
export class UserToBookService {
  constructor(
    @InjectRepository(UserToBook)
    private userToBookRepo: Repository<UserToBook>,
    @InjectRepository(Book) private bookReposistory: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
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
  async isReadyToBorrow(userId: number, bookId: number) {
    const isBorrowed = await this.isBorrowed(userId, bookId);
    if (!isBorrowed) {
      const book = await this.bookReposistory.findOne({
        where: { id: bookId },
      });
      if (book.quantity == 0) {
        throw new BadRequestException(`This book is not available now `);
      } else return book;
    } else {
      throw new BadRequestException(
        `This book is already in ${isBorrowed.status} state`,
      );
    }
  }

  async updateBorrowStatus(borrowId: number, status: statusState) {
    const userToBook = await this.userToBookRepo.findOne({
      where: { userToBookId: borrowId },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        receiverSeen: true,
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
    if (!userToBook) {
      throw new NotFoundException('check details');
    }
    const newUserToBook = {
      ...userToBook,
      status,
      receiverSeen: false,
      receiverRole: 'user',
    };
    if (userToBook.status != status) {
      await this.bookReposistory.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.update(
            UserToBook,
            { userToBookId: userToBook.userToBookId },
            newUserToBook,
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

    this.eventEmitter.emit('userNotif.userToBook.changes', {
      userToBookId: newUserToBook.userToBookId,
      status: newUserToBook.status,
      userId: newUserToBook.user.id,
      userName: newUserToBook.user.name,
      userLastName: newUserToBook.user.lastName,
      bookId: newUserToBook.book.id,
      bookTitle: newUserToBook.book.title,
      endDate: newUserToBook.endDate,
      startDate: newUserToBook.startDate,
      receiverRole: newUserToBook.receiverRole,
      receiverSeen: newUserToBook.receiverSeen,
      email: newUserToBook.user.email,
    });

    return await this.getBorrowList({
      userToBookId: newUserToBook.userToBookId,
    });
  }

  async updateUserBorrow({
    borrowId,
    startDate,
    endDate,
  }: UpdateUserBorrowDto) {
    const userToBook = await this.userToBookRepo.findOne({
      where: {
        userToBookId: borrowId,
      },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        receiverSeen: true,
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
    if (!userToBook || userToBook.status != 'Pending') {
      throw new NotFoundException('Updating is not possible');
    }

    const updated = await this.userToBookRepo.save({
      userToBookId: userToBook.userToBookId,
      userId: userToBook.userId,
      bookId: userToBook.bookId,
      status: userToBook.status,
      receiverRole: userToBook.receiverRole,
      receiverSeen: userToBook.receiverSeen,
      startDate,
      endDate,
    });
    return {
      userToBookId: userToBook.userToBookId,
      status: userToBook.status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: updated.endDate,
      startDate: updated.startDate,
      receiverSeen: userToBook.receiverSeen,
    };
  }
  async CancelUserBorrow({ borrowId }: CancelBorrowDto) {
    const userToBook = await this.userToBookRepo.findOne({
      where: {
        userToBookId: borrowId,
      },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        receiverSeen: true,
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
    if (!userToBook || userToBook.status != 'Pending') {
      throw new NotFoundException('Canceling is not possible');
    }

    const updated = await this.userToBookRepo.save({
      userToBookId: userToBook.userToBookId,
      userId: userToBook.userId,
      bookId: userToBook.bookId,
      status: 'Canceled',
      receiverRole: userToBook.receiverRole,
      receiverSeen: userToBook.receiverSeen,
      startDate: userToBook.startDate,
      endDate: userToBook.endDate,
    });
    return {
      userToBookId: userToBook.userToBookId,
      status: updated.status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: userToBook.endDate,
      startDate: userToBook.startDate,
      receiverSeen: userToBook.receiverSeen,
    };
  }

  async borrow(
    { idBook, startDate, endDate }: BorrowBookDto,
    currentUser: User,
  ) {
    let userToBook: UserToBook;
    const book = await this.isReadyToBorrow(currentUser.id, idBook);
    if (book) {
      const user = await this.userRepository.findOne({
        where: { id: currentUser.id },
      });
      await this.bookReposistory.manager.transaction(
        async (transactionalEntityManager) => {
          const detailBorrow = transactionalEntityManager.create(UserToBook, {
            bookId: idBook,
            userId: currentUser.id,
            startDate,
            endDate,
            status: borrowStatus.Pending,
            receiverRole: 'admin',
          });
          userToBook = await transactionalEntityManager.save(UserToBook, {
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
    this.eventEmitter.emit('adminNotif.userToBook.changes', {
      userToBookId: userToBook.userToBookId,
      status: userToBook.status,
      userId: userToBook.userId,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      bookId: userToBook.bookId,
      bookTitle: userToBook.book.title,
      endDate: userToBook.endDate,
      startDate: userToBook.startDate,
      receiverRole: userToBook.receiverRole,
      receiverSeen: userToBook.receiverSeen,
      email: userToBook.user.email,
    });
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

  async getBorrowList(userToBooksParams?: {
    userId?: number;
    userToBookId?: number;
  }) {
    const userToBook = await this.userToBookRepo.find({
      where: {
        userId: userToBooksParams?.userId,
        userToBookId: userToBooksParams?.userToBookId,
      },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        createdDate: true,
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

    return instanceToPlain(
      userToBook
        .sort((a, b) => (a.createdDate <= b.createdDate ? 1 : -1))
        .map((userToBook) => ({
          createdDate: userToBook.createdDate,
          userToBookId: userToBook.userToBookId,
          status: userToBook.status,
          userId: userToBook.user.id,
          userName: userToBook.user.name,
          userLastName: userToBook.user.lastName,
          email: userToBook.user.email,
          bookId: userToBook.book.id,
          bookTitle: userToBook.book.title,
          endDate: userToBook.endDate,
          startDate: userToBook.startDate,
        })),
    );
  }
}

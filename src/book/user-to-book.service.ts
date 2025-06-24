import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToBook, status as borrowStatus } from './entities/userToBook';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { User } from 'src/common/entities/user.entity';
import * as moment from 'moment';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateUserBorrowDto } from './dto/update-user-borrow.dto';
import { CancelBorrowDto } from './dto/cancel-borrow.dto';
import { UpdateBorrowBookDto } from './dto/update-borrow-book.dto';
import { Notification } from 'src/notifications/entities/notification.entity';
import { BorrowNotificationService } from 'src/notifications/borrow-notification.service';

@Injectable()
export class UserToBookService {
  constructor(
    @InjectRepository(UserToBook)
    private userToBookRepo: Repository<UserToBook>,
    @InjectRepository(Book) private bookReposistory: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationService: BorrowNotificationService,
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

  async updateBorrowStatus(
    { borrowId, status }: UpdateBorrowBookDto,
    user: User,
  ) {
    const userToBook = await this.userToBookRepo.findOne({
      where: { userToBookId: borrowId },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        createdDate: true,
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
    if (!userToBook) {
      throw new NotFoundException('check details');
    }
    const newUserToBook = {
      ...userToBook,
      status,
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
    } else throw new ConflictException('Same status');
    const notification = {
      sender: user,
      receiver: userToBook.user,
      message: `Your borrow request for ${userToBook.book.title} is in ${status} state`,
    };
    const savedNotif = await this.notificationRepository.save(notification);

    this.notificationService.sendToUser(notification.receiver.id, plainToInstance(Notification,savedNotif));
    return {
      userToBookId: userToBook.userToBookId,
      createdDate: userToBook.createdDate,
      status: status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: userToBook.endDate,
      startDate: userToBook.startDate,
    };
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
    if (!userToBook || userToBook.status != 'Pending') {
      throw new NotFoundException('Updating is not possible');
    }

    const updated = await this.userToBookRepo.save({
      userToBookId: userToBook.userToBookId,
      userId: userToBook.userId,
      bookId: userToBook.bookId,
      status: userToBook.status,
      startDate,
      endDate,
    });
    return {
      userToBookId: userToBook.userToBookId,
      createdDate: userToBook.createdDate,
      status: userToBook.status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: updated.endDate,
      startDate: updated.startDate,
    };
  }
  async CancelUserBorrow({ borrowId }: CancelBorrowDto) {
    const userToBook = await this.userToBookRepo.findOne({
      where: {
        userToBookId: borrowId,
      },
      relations: { book: true, user: true },
      select: {
        createdDate: true,
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
    if (!userToBook || userToBook.status != 'Pending') {
      throw new NotFoundException('Canceling is not possible');
    }
    const notifReceiver = await this.userRepository.findOne({
      where: { admin: true },
    });
    const notification = {
      receiver: notifReceiver,
      sender: userToBook.user,
      message: `The borrow request for ${userToBook.book.title} has been canceled`,
    };
    const savedNotification =
      await this.notificationRepository.save(notification);

    this.notificationService.sendToUser(
      savedNotification.receiver.id,
      plainToInstance(Notification,savedNotification),
    );

    const updated = await this.userToBookRepo.save({
      userToBookId: userToBook.userToBookId,
      userId: userToBook.userId,
      bookId: userToBook.bookId,
      status: 'Canceled',
      startDate: userToBook.startDate,
      endDate: userToBook.endDate,
    });
    return {
      userToBookId: userToBook.userToBookId,
      createdDate: userToBook.createdDate,
      status: updated.status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: userToBook.endDate,
      startDate: userToBook.startDate,
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
    const admin = await this.userRepository.findOne({ where: { admin: true } });
    const notification = {
      receiver: admin,
      sender: userToBook.user,
      message: `${userToBook.user.name} has asked to borrow ${book.title}`,
    };
    const savedNotification =
      await this.notificationRepository.save(notification);
    this.notificationService.sendToUser(
      savedNotification.receiver.id,
      plainToInstance(Notification,savedNotification),
    );
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
  return userToBook
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
        }))
  }
}

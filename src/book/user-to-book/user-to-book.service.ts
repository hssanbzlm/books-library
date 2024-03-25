import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToBook } from '../entities/userToBook';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BorrowBookDto } from '../dto/borrow-book.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserToBookService {
  constructor(
    @InjectRepository(UserToBook)
    private userToBookRepo: Repository<UserToBook>,
    @InjectRepository(Book) private bookReposistory: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async isBorrowed(userId: number, bookId: number) {
    const book = await this.userToBookRepo.findOneBy({
      userId,
      bookId,
      isBack: false,
    });
    return book;
  }

  async borrowBack(bookId: number, userId: number) {
    const userToBook = await this.isBorrowed(userId, bookId);
    if (!userToBook || userToBook.isBack) {
      throw new NotFoundException('check details');
    }
    await this.bookReposistory.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          UserToBook,
          { userToBookId: userToBook.userToBookId },
          { ...userToBook, isBack: true },
        );
        await transactionalEntityManager.increment(
          Book,
          { id: bookId },
          'quantity',
          1,
        );
      },
    );
  }

  async borrow(
    { idBook, startDate, endDate }: BorrowBookDto,
    currentUser: User,
  ) {
    const isBorrowed = await this.isBorrowed(currentUser.id, idBook);
    if (isBorrowed) {
      throw new BadRequestException('You can not borrow the same book ');
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
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { Author } from 'src/author/entities/author.entity';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { User } from 'src/auth/entities/user.entity';
import { UserToBook } from './entities/userToBook';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    @InjectRepository(UserToBook)
    private userToBookRepo: Repository<UserToBook>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    const authors = await Promise.all(
      createBookDto.authorIds.map((id) => this.preloadAuthorById(id)),
    );
    const book = this.bookRepo.create({ ...createBookDto, authors });
    return this.bookRepo.save(book);
  }

  findAll() {
    return this.bookRepo.find({ relations: { authors: true } });
  }

  async findOne(id: number) {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: { authors: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} does not exist`);
    return book;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    const book = this.bookRepo.findBy({ id });
    if (!book) throw new NotFoundException('This book does not exist');

    return this.bookRepo
      .createQueryBuilder()
      .update(updateBookDto)
      .set(updateBookDto)
      .where('id= :id', { id })
      .execute();
  }

  remove(id: number) {
    return this.bookRepo.delete({ id });
  }

  async borrow({ idBook, idUser, startDate, endDate }: BorrowBookDto) {
    const book = await this.bookRepo.findOne({ where: { id: idBook } });
    const user = await this.userRepo.findOne({ where: { id: idUser } });
    if (book && user) {
      const detailBorrow = this.userToBookRepo.create({
        bookId: idBook,
        userId: idUser,
        startDate,
        endDate,
      });
      return this.userToBookRepo.save({ ...detailBorrow, book, user });
    }
    throw new NotFoundException('Resources not found');
  }

  private async preloadAuthorById(id: number): Promise<Author> {
    const [existingAuthor] = await this.authorRepo.findBy({ id });
    if (existingAuthor) {
      return existingAuthor;
    }
    throw new NotFoundException(`Author ${id} not found`);
  }
}

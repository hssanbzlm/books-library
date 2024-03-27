import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository, Like } from 'typeorm';
import { Author } from 'src/author/entities/author.entity';
import { User } from 'src/auth/entities/user.entity';
import * as moment from 'moment';
import { UserToBookService } from './user-to-book/user-to-book.service';
import { QueryBookDto } from './dto/query-book.dto';
import { CloudinaryService } from 'src/cloudinary/service/cloudinary/cloudinary.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Author) private authorRepo: Repository<Author>,
    private userToBookService: UserToBookService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createBookDto: CreateBookDto, cover: Express.Multer.File) {
    let uploadedFile = null;
    if (cover) {
      uploadedFile = await this.cloudinaryService.uploadFile(cover);
    }
    const authors = await Promise.all(
      createBookDto.authorIds.map((id) => this.preloadAuthorById(id)),
    );
    const book = this.bookRepo.create({
      ...createBookDto,
      coverPath: uploadedFile && uploadedFile.secure_url,
      authors,
    });
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
    const book = this.bookRepo.findOneBy({ id });
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

  private async preloadAuthorById(id: number): Promise<Author> {
    const existingAuthor = await this.authorRepo.findOneBy({ id });
    if (existingAuthor) {
      return existingAuthor;
    }
    throw new NotFoundException(`Author ${id} not found`);
  }

  async borrowList() {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const queryResult: [] = await this.userRepo
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

  filter({ title, edition }: QueryBookDto) {
    return this.bookRepo.findBy({
      title: Like(`%${title}%`),
      edition: Like(`%${edition}%`),
    });
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
}

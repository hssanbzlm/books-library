import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository, Like } from 'typeorm';
import { QueryBookDto } from './dto/query-book.dto';
import { CloudinaryService } from 'src/book/cloudinary.service';
import { BookRecommendService } from './book-recommend.service';
import { FileUpload } from 'graphql-upload';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private cloudinaryService: CloudinaryService,
    private bookRecommendService: BookRecommendService,
  ) {}

  async create(
    createBookDto: CreateBookDto,
    cover:{buffer:string,filename:any,mimetype:any},
  ) {
    let uploadedFile = null;
    uploadedFile = await this.cloudinaryService.uploadStreamFile(
      cover
    );

    createBookDto.coverPath = uploadedFile.secure_url;

    const bookVector = await this.bookRecommendService.generateBookEmbedding(
      `authors: ${createBookDto.authors.join('')}\ntitle: ${createBookDto.title}\ncategory:${createBookDto.category}\nsynopsis: ${createBookDto.synopsis}`,
    );
    const book = this.bookRepo.create({
      ...createBookDto,
      embedding: bookVector,
    });
    return this.bookRepo.save(book);
  }

  async findAll() {
    return this.bookRepo.find();
  }

  async findOne(id: number) {
    const book = await this.bookRepo.findOne({
      where: { id },
    });
    if (!book) throw new NotFoundException(`Book ${id} does not exist`);
    return book;
  }

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    cover:{buffer:string,filename:any,mimetype:any},
  ) {
    const book = await this.bookRepo.findOneBy({ id });
    if (!book) throw new NotFoundException('This book does not exist');
    let uploadedFile = null;
    let oldFile = null;
    if (cover) {
      oldFile = book.coverPath;
      uploadedFile = await this.cloudinaryService.uploadStreamFile(cover);
      updateBookDto.coverPath = uploadedFile.secure_url;
    }

    await this.bookRepo.update({ id }, { ...updateBookDto });
    const updatedBook = await this.bookRepo.findOneBy({ id });

    if (oldFile) await this.cloudinaryService.removeFile(oldFile);
    return updatedBook;
  }

  remove(id: number) {
    return this.bookRepo.delete({ id });
  }

  filter({ title, edition }: QueryBookDto) {
    return this.bookRepo.findBy({
      title: Like(`%${title}%`),
      edition: Like(`%${edition}%`),
    });
  }
}

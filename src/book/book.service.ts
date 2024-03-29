import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository, Like } from 'typeorm';
import { QueryBookDto } from './dto/query-book.dto';
import { CloudinaryService } from 'src/cloudinary/service/cloudinary/cloudinary.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createBookDto: CreateBookDto, cover: Express.Multer.File) {
    let uploadedFile = null;
    if (cover) {
      uploadedFile = await this.cloudinaryService.uploadFile(cover);
      createBookDto.coverPath = uploadedFile.secure_url;
    }
    const book = this.bookRepo.create({
      ...createBookDto,
    });
    return this.bookRepo.save(book);
  }

  findAll() {
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
    cover: Express.Multer.File,
  ) {
    const book = await this.bookRepo.findOneBy({ id });
    if (!book) throw new NotFoundException('This book does not exist');
    let uploadedFile = null;
    let oldFile = null;
    if (cover) {
      oldFile = book.coverPath;
      uploadedFile = await this.cloudinaryService.uploadFile(cover);
      updateBookDto.coverPath = uploadedFile.secure_url;
    }

    const updatedBook = this.bookRepo
      .createQueryBuilder()
      .update(updateBookDto)
      .set({
        ...updateBookDto,
      })
      .where('id= :id', { id })
      .execute();

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

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository, Like } from 'typeorm';
import { QueryBookDto } from './dto/query-book.dto';
import { CloudinaryService } from 'src/cloudinary/service/cloudinary/cloudinary.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { RecommendBookDto } from './dto/recommend-book.dto';

const EMBEDDING_URL = 'https://api.together.xyz/v1/embeddings';
const EMBEDDING_MODEL = 'WhereIsAI/UAE-Large-V1';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createBookDto: CreateBookDto, cover: Express.Multer.File) {
    let uploadedFile = null;
    if (cover) {
      uploadedFile = await this.cloudinaryService.uploadFile(cover);
      createBookDto.coverPath = uploadedFile.secure_url;
    }
    const bookVector = await this.generateBookEmbedding(
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

    await this.bookRepo.save({ id, ...updateBookDto });
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
  async recommend({ text }: RecommendBookDto) {
    const books = await this.bookCosineSimilarity(text);
    return books.map((book) => ({
      title: book.title,
      synopsis: book.synopsis,
    }));
  }

  private async generateBookEmbedding(dataToEmbed: any): Promise<number[]> {
    const token = this.configService.get<string>('EMBEDDING_TOKEN');

    const response = await lastValueFrom(
      this.httpService.post(
        EMBEDDING_URL,
        { model: EMBEDDING_MODEL, input: [dataToEmbed] },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    return response.data.data[0].embedding;
  }

  private async bookCosineSimilarity(text: string) {
    const targetVectorNumber = await this.generateBookEmbedding(text);
    const targetVectorString = `[${targetVectorNumber.join(',')}]`;

    const result = (await this.bookRepo.query(
      `
      SELECT *, (embedding::vector) <-> $1::vector AS similarity
      FROM book
      ORDER BY similarity ASC
      LIMIT $2 
      `,
      [targetVectorString, 5],
    )) as Book[];
    return result;
  }
}

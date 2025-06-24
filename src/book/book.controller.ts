import { Controller } from '@nestjs/common';
import { BookService } from './book.service';
import { BookRecommendService } from './book-recommend.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly bookRecommendService: BookRecommendService,
  ) {}

  @MessagePattern({ cmd: 'recommend.books' })
  recommend(text) {
    return this.bookRecommendService.recommend(text);
  }

  @MessagePattern({ cmd: 'all.books' })
  findAll() {
    return this.bookService.findAll();
  }

  @MessagePattern({ cmd: 'create.book' })
  create({ createBookDto, cover }) {
    return this.bookService.create(createBookDto, cover);
  }

  @MessagePattern({ cmd: 'filter.books' })
  filterBooks(query) {
    return this.bookService.filter(query);
  }

  @MessagePattern({ cmd: 'find.book' })
  findOne(id) {
    return this.bookService.findOne(id);
  }

  @MessagePattern({ cmd: 'update.book' })
  update({ id, updateBookDto, cover }) {
    return this.bookService.update(id, updateBookDto, cover);
  }

  @MessagePattern({ cmd: 'remove.book' })
  remove(id) {
    return this.bookService.remove(id);
  }
}

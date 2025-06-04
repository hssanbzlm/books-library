import { Resolver, Query } from '@nestjs/graphql';
import { BookService } from './book.service';

@Resolver('Book')
export class BookResolver {
  constructor(private bookService: BookService) {}
   

  @Query('books')
  getBooks() {
    return this.bookService.findAll();
  }

  @Query('book')
  getBook(id: number) {
    return this.bookService.findOne(id);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject('BOOK_SERVICE') private bookClient: ClientProxy) {}

  getBooks() {
    return this.bookClient.send({ cmd: 'all.books' },{});
  }

  recommendBooks(data) {
    return this.bookClient.send({cmd:'recommend.books'},data)
  }
  create(data) {
    return this.bookClient.send({cmd:'create.book'},data)
  }

  filterBooks(data) {
    return this.bookClient.send({cmd:'filter.books'},data)
  }
  findOne(data) {
    return this.bookClient.send({cmd:'find.book'},data)
  }
  update(data) {
    return this.bookClient.send({cmd:'update.book'},data)
  }
  remove(data) {
    return this.bookClient.send({cmd:'remove.book'},data)
  }
}

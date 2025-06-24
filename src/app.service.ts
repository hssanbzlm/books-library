import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileUpload } from 'graphql-upload';
import { CreateBookDto } from './book/dto/create-book.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('BOOK_SERVICE') private bookClient: ClientProxy,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  getBooks() {
    return this.bookClient.send({ cmd: 'all.books' }, {});
  }

  recommendBooks(data) {
    return this.bookClient.send({ cmd: 'recommend.books' }, data);
  }
  async create(data) {
    const file = await data.cover;
    const stream = file.file.createReadStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return this.bookClient.send(
      { cmd: 'create.book' },
      {
        createBookDto: data.createBookDto,
        cover: {
          buffer: buffer.toString('base64'),
          filename: file.filename,
          mimetype: file.mimetype,
        },
      },
    );
  }

  filterBooks(data) {
    return this.bookClient.send({ cmd: 'filter.books' }, data);
  }
  findOne(data) {
    return this.bookClient.send({ cmd: 'find.book' }, data);
  }
  async update(data) {
    const file = await data.cover;
    const stream = file.file.createReadStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return this.bookClient.send(
      { cmd: 'update.book' },
      {
        ...data,
        cover: {
          buffer: buffer.toString('base64'),
          filename: file.filename,
          mimetype: file.mimetype,
        },
      },
    );
  }
  remove(data) {
    return this.bookClient.send({ cmd: 'remove.book' }, data);
  }
  signin(data) {
    return this.authClient.send({ cmd: 'signin' }, data);
  }
  signup(data) {
    return this.authClient.send({ cmd: 'signup' }, data);
  }
  signout(data) {
    return this.authClient.send({ cmd: 'signout' }, data);
  }

  whoami(data) {
    return this.authClient.send({ cmd: 'whoami' }, data);
  }
  userList() {
    return this.authClient.send({ cmd: 'user-list' }, {});
  }
  findAllUser() {
    return this.userClient.send({ cmd: 'user-list' }, {});
  }
  findOneUser(data) {
    return this.userClient.send({ cmd: 'user.findOne' }, data);
  }
  updateUser(data) {
    return this.userClient.send({ cmd: 'user.updateOne' }, data);
  }
  updateUserActivity(data) {
    return this.userClient.send({ cmd: 'user.updateActivity' }, data);
  }
  removeOneUser(data) {
    return this.userClient.send({ cmd: 'user.removeOne' }, data);
  }

  getBorrowList(data: any) {
    return this.bookClient.send({ cmd: 'borrow.list' }, data);
  }
  borrow(data: any) {
    return this.bookClient.send({ cmd: 'borrow' }, data);
  }
  updateBorrow(data: any) {
    return this.bookClient.send({ cmd: 'borrow.update' }, data);
  }
  isReadyToBorrow(data: any) {
    return this.bookClient.send({ cmd: 'borrow.isReadyToBorrow' }, data);
  }
  updateUserBorrow(data: any) {
    return this.bookClient.send({ cmd: 'borrow.updateUserBorrow' }, data);
  }
  cancelUserBorrow(data: any) {
    return this.bookClient.send({ cmd: 'borrow.cancelUserBorrow' }, data);
  }
}

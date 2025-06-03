import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

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
  create(data) {
    return this.bookClient.send({ cmd: 'create.book' }, data);
  }

  filterBooks(data) {
    return this.bookClient.send({ cmd: 'filter.books' }, data);
  }
  findOne(data) {
    return this.bookClient.send({ cmd: 'find.book' }, data);
  }
  update(data) {
    return this.bookClient.send({ cmd: 'update.book' }, data);
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
    return this.userClient.send({cmd:'user-list'},{})
  }
  findOneUser(data) {
    return this.userClient.send({cmd:'user.findOne'},data)
  }
  updateUser(data) {
    return this.userClient.send({cmd:'user.updateOne'},data)
  }
  updateUserActivity(data) {
    return this.userClient.send({cmd:'user.updateActivity'},data)
  }
  removeOneUser(data) {
    return this.userClient.send({cmd:'user.removeOne'},data)
  }
}

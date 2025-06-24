import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { currentUser } from 'src/decorators/current-user/gql-current-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/gql-auth.guard';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';
import { CreateBookDto } from './dto/create-book.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { UpdateBookDto } from './dto/update-book.dto';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { UpdateBorrowBookDto } from './dto/update-borrow-book.dto';
import { UpdateUserBorrowDto } from './dto/update-user-borrow.dto';
import { AppService } from 'src/app.service';

@Resolver('Book')
export class BookResolver {
  constructor(private readonly appService: AppService) {}

  @Query('books')
  getBooks() {
    return this.appService.getBooks();
  }

  @Query('book')
  getBook(@Args('id') id: number) {
    return this.appService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Query('borrowList')
  getBorrowList(@currentUser() user: User) {
    if (user.admin) return this.appService.getBorrowList({});
    else return this.appService.getBorrowList({ userId: user.id });
  }

  @Query('recommend')
  recommendBook(@Args('text') text: string) {
    return this.appService.recommendBooks(text);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('removeBook')
  removeBook(@Args('id') id: string) {
    return this.appService.remove(id);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('addBook')
  addBook(
    @Args('book') book: CreateBookDto,
    @Args({ name: 'cover', type: () => GraphQLUpload }) cover: FileUpload,
  ) {
    return this.appService.create({ cover, createBookDto: book });
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('updateBook')
  updateBook(
    @Args('book') book: UpdateBookDto,
    @Args('id') id: number,
    @Args({ name: 'cover', type: () => GraphQLUpload, nullable: true })
    cover?: FileUpload,
  ) {
    return this.appService.update({ updateBookDto: book, cover, id });
  }

  @UseGuards(AuthGuard)
  @Mutation('borrow')
  borrow(
    @Args('borrowDetails') borrowDetails: BorrowBookDto,
    @currentUser() user,
  ) {
    return this.appService.borrow({ borrowDetails, user });
  }
  @UseGuards(AdminAuthGuard)
  @Mutation('updateBorrow')
  updateBorrow(
    @Args('borrowUpdate') borrowUpdate: UpdateBorrowBookDto,
    @currentUser() user,
  ) {
    return this.appService.updateBorrow({ borrowUpdate, user });
  }

  @UseGuards(AuthGuard)
  @Mutation('isReadyToBorrow')
  isReadyToBorrow(@Args('bookId') bookId: number, @currentUser() user: User) {
    return this.appService.isReadyToBorrow({ bookId, user });
  }
  @UseGuards(AuthGuard)
  @Mutation('updateUserBorrow')
  updateUserBorrow(@Args('borrowUpdate') borrowUpdate: UpdateUserBorrowDto) {
    return this.appService.updateUserBorrow({ borrowUpdate });
  }
  @UseGuards(AuthGuard)
  @Mutation('cancelUserBorrow')
  cancelUserBorrow(@Args('borrowId') borrowId: number) {
    return this.appService.cancelUserBorrow({ borrowId });
  }
}

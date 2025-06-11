import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { BookService } from './book.service';
import { UserToBookService } from './user-to-book.service';
import { currentUser } from 'src/decorators/current-user/gql-current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/gql-auth.guard';
import { BookRecommendService } from './book-recommend.service';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';
import { CreateBookDto } from './dto/create-book.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { UpdateBookDto } from './dto/update-book.dto';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { UpdateBorrowBookDto } from './dto/update-borrow-book.dto';
import { UpdateUserBorrowDto } from './dto/update-user-borrow.dto';

@Resolver('Book')
export class BookResolver {
  constructor(
    private bookService: BookService,
    private userToBookService: UserToBookService,
    private readonly bookRecommendService: BookRecommendService,
  ) {}

  @Query('books')
  getBooks() {
    return this.bookService.findAll();
  }

  @Query('book')
  getBook(@Args('id') id: number) {
    return this.bookService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Query('borrowList')
  getBorrowList(@currentUser() user: User) {
    if (user.admin) return this.userToBookService.getBorrowList();
    else return this.userToBookService.getBorrowList({ userId: user.id });
  }

  @Query('recommend')
  recommendBook(@Args('text') text: string) {
    return this.bookRecommendService.recommend(text);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('removeBook')
  removeBook(@Args('id') id: string) {
    return this.bookService.remove(+id);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('addBook')
  addBook(
    @Args('book') book: CreateBookDto,
    @Args({ name: 'cover', type: () => GraphQLUpload }) cover: FileUpload,
  ) {
    return this.bookService.create(book, cover);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('updateBook')
  updateBook(
    @Args('book') book: UpdateBookDto,
    @Args('id') id: number,
    @Args({ name: 'cover', type: () => GraphQLUpload,nullable:true }) cover?: FileUpload,
  ) {
    return this.bookService.update(id, book, cover);
  }

  @UseGuards(AuthGuard)
  @Mutation('borrow')
  borrow(@Args('borrowDetails')borrowDetails:BorrowBookDto, @currentUser() user){
    return this.userToBookService.borrow(borrowDetails,user)
  }
  @UseGuards(AdminAuthGuard)
  @Mutation('updateBorrow')
  updateBorrow(@Args('borrowUpdate') borrowUpdate:UpdateBorrowBookDto){
    return this.userToBookService.updateBorrowStatus(borrowUpdate)
  }

  @UseGuards(AuthGuard)
  @Mutation('isReadyToBorrow')
  isReadyToBorrow(@Args('bookId') bookId:number,@currentUser() user:User){
    return this.userToBookService.isReadyToBorrow(user.id,bookId)
  }
  @UseGuards(AuthGuard)
  @Mutation('updateUserBorrow')
  updateUserBorrow(@Args('borrowUpdate') borrowUpdate:UpdateUserBorrowDto){
    return this.userToBookService.updateUserBorrow(borrowUpdate)
  }
  @UseGuards(AuthGuard)
  @Mutation('cancelUserBorrow')
  cancelUserBorrow(@Args('borrowId') borrowId:number){
    return this.userToBookService.CancelUserBorrow({borrowId})
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { currentUser } from '../decorators/current-user/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '../guards/auth-guard.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { BorrowBookBackDto } from './dto/broow-book-back.dto';
import { UserToBookService } from './user-to-book/user-to-book.service';
import { QueryBookDto } from './dto/query-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly userToBookService: UserToBookService,
  ) {}

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Post()
  create(
    @UploadedFile() cover: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.bookService.create(createBookDto, cover);
  }

  @Get('filter')
  filterBooks(@Query() query: QueryBookDto) {
    return this.bookService.filter(query);
  }
  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    return this.bookService.update(id, updateBookDto, cover);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post('borrow')
  borrowBook(@Body() body: BorrowBookDto, @currentUser() currentUser: User) {
    return this.userToBookService.borrow(body, currentUser);
  }

  @UseGuards(AuthGuard)
  @Post('borrow-back')
  borrowBookBack(
    @Body() body: BorrowBookBackDto,
    @currentUser() currentUser: User,
  ) {
    return this.userToBookService.borrowBack(body.idBook, currentUser.id);
  }
}

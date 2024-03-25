import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { currentUser } from '../decorators/current-user/current-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuard } from '../guards/auth-guard.guard';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post('borrow')
  borrowBook(@Body() body: BorrowBookDto, @currentUser() currentUser: User) {
    return this.bookService.borrow(body, currentUser);
  }
}

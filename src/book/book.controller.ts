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
import { AdminGuard } from 'src/guards/admin.guard';
import { QueryBookDto } from './dto/query-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  findAll() {
    return this.bookService.findAll();
  }

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
}

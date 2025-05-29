import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBookDto } from './book/dto/update-book.dto';
import { AdminGuard } from './guards/admin.guard';
import { CreateBookDto } from './book/dto/create-book.dto';
import { QueryBookDto } from './book/dto/query-book.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/book')
  getBooks() {
    return this.appService.getBooks();
  }

  @Get('book/recommend')
  recommendBooks(@Query('text') text:string) {
    return this.appService.recommendBooks(text);
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Post('/book')
  create(
    @UploadedFile() cover: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.appService.create({cover,createBookDto});
  }

  @Get('book/filter')
  filterBooks(@Query() query: QueryBookDto) {
    return this.appService.filterBooks(query);
  }

  @Get('book/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Patch('book/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() cover: Express.Multer.File,
  ) {
    return this.appService.update({updateBookDto,cover,id});
  }

  @UseGuards(AdminGuard)
  @Delete('book/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appService.remove(id);
  }
}

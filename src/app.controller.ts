import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Session,
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
import { CreateUserDto } from './auth/dtos/create-user.dto';
import { SigninUserDto } from './auth/dtos/signin-user.dto';
import { User } from './common/entities/user.entity';
import { currentUser } from './common/decorators/current-user/current-user.decorator';
import { AuthGuard } from './guards/auth-guard.guard';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { UpdateUserActivity } from './user/dtos/update-user-activity';
import { UpdateUserDto } from './user/dtos/update-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/book')
  getBooks() {
    return this.appService.getBooks();
  }

  @Get('book/recommend')
  recommendBooks(@Query('text') text: string) {
    return this.appService.recommendBooks(text);
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('cover'))
  @Post('/book')
  create(
    @UploadedFile() cover: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.appService.create({ cover, createBookDto });
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
    return this.appService.update({ updateBookDto, cover, id });
  }

  @UseGuards(AdminGuard)
  @Delete('book/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appService.remove(id);
  }

  @UseGuards(AdminGuard)
  @Post('auth/signup')
  signup(@Body() body: CreateUserDto) {
    return this.appService.signup(body);
  }

  @Post('auth/signin')
  async signin(
    @Body() { email, password }: SigninUserDto,
    @Session() session: any,
  ) {
    const user = await lastValueFrom(
      this.appService.signin({ email, password }),
    );
    // with plainToInstance used explicitly, there is no need to use classSerializeInterceptor
    // returned result will automatically apply @exclude on password
    const userInstance = plainToInstance(User, user);
    session.userId = user.id;
    return userInstance;
  }

  @Post('auth/signout')
  async signout(@Session() session: any) {
    session.userId = null;
  }

  @UseGuards(AuthGuard)
  @Get('auth/whoami')
  async whoami(@currentUser() user: User) {
    const authUser = await lastValueFrom(this.appService.whoami(user));
    const plainAuthUser = plainToInstance(User, authUser);
    return plainAuthUser;
  }
  @Get()
  usersList() {
    return this.appService.userList();
  }

  @UseGuards(AdminGuard)
  @Get('user')
  findAll() {
    return this.appService.findAllUser();
  }
  @UseGuards(AdminGuard)
  @Get('user/:id')
  findOneUser(@Param('id') id: string) {
    return this.appService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Delete('user/:id')
  deleteOne(@Param('id') id: string) {
    return this.appService.removeOneUser(+id);
  }

  @UseGuards(AdminGuard)
  @Patch('user/update-activity/:id')
  updateActivity(
    @Param('id') id: string,
    @Body() updateUserActivityDto: UpdateUserActivity,
  ) {
    return this.appService.updateUserActivity({
      id: +id,
      updateUserActivityDto,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('user/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.appService.updateUser({ id: +id, updateUserDto });
  }
}

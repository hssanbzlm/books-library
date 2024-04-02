import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Session,
  UseInterceptors,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SigninUserDto } from './dtos/signin-user.dto';
import { AdminGuard } from 'src/guards/admin.guard';

// classSerializerInterceptor use the magic of class-transform (@Exclude)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AdminGuard)
  @Post('/signup')
  signup(@Body() body: CreateUserDto) {
    const savedUser = this.authService.signup(body);
    return savedUser;
  }

  @Post('/signin')
  async signin(
    @Body() { email, password }: SigninUserDto,
    @Session() session: any,
  ) {
    const user = await this.authService.signin(email, password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  async signout(@Session() session: any) {
    session.userId = null;
  }
  @Get()
  usersList() {
    return this.authService.userList();
  }
}

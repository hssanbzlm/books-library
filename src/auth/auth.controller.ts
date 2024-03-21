import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Session,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SigninUserDto } from './dtos/signin-user.dto';

// classSerializerInterceptor use the magic of class-transform (@Exclude)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
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
  }

  @Post('/signout')
  async signout(@Session() session: any) {
    session.userId = null;
  }
}

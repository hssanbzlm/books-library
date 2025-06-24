import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from '../common/entities/user.entity';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern({ cmd: 'signup' })
  signup(body: CreateUserDto) {
    const savedUser = this.authService.signup(body);
    return savedUser;
  }

  @MessagePattern({ cmd: 'signin' })
  async signin({ email, password, session }) {
    const user = await this.authService.signin(email, password);
    return user;
  }

  @MessagePattern({ cmd: 'signout' })
  async signout(session: any) {
    session.userId = null;
  }
  @MessagePattern({ cmd: 'whoami' })
  whoami(user: User) {
    return user;
  }
  @MessagePattern({ cmd: 'user-list' })
  usersList() {
    return this.authService.userList();
  }
}

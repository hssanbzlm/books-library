import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'user-list' })
  findAll() {
    return this.userService.findAll();
  }
  @MessagePattern({ cmd: 'user.findOne' })
  findOne(id: string) {
    return this.userService.findOne(+id);
  }

  @MessagePattern({ cmd: 'user.removeOne' })
  deleteOne(id: string) {
    return this.userService.removeOne(+id);
  }

  @MessagePattern({ cmd: 'user.updateActivity' })
  updateActivity({ id, updateUserActivityDto }) {
    return this.userService.updateActivity(+id, updateUserActivityDto);
  }

  @MessagePattern({ cmd: 'user.updateOne' })
  update({ id, updateUserDto }) {
    return this.userService.update(+id, updateUserDto);
  }
}

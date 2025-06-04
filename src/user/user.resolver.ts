import { Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query('users')
  getUsers() {
    return this.userService.findAll();
  }
  @Query('user')
  getUser(id: number) {
    return this.userService.findOne(id);
  }
}

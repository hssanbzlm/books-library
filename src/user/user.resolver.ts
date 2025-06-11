import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';
import { AuthGuard } from 'src/guards/gql-auth.guard';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(AdminAuthGuard)
  @Query('users')
  getUsers() {
    return this.userService.findAll();
  }
  @UseGuards(AdminAuthGuard)
  @Query('user')
  getUser(id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('deleteUser')
  deleteUser(id: number) {
    return this.userService.removeOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('updateActivity')
  updateActivity(@Args('id') id: number, @Args('active') active: boolean) {
    return this.userService.updateActivity(id, { active });
  }

  @UseGuards(AuthGuard)
  @Mutation('updateUser')
  updateUser(@Args('id') id: string, @Args('password') password: string) {
    return this.userService.update(+id, { password });
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';
import { AuthGuard } from 'src/guards/gql-auth.guard';
import { AppService } from 'src/app.service';

@Resolver('User')
export class UserResolver {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AdminAuthGuard)
  @Query('users')
  getUsers() {
    return this.appService.userList();
  }
  @UseGuards(AdminAuthGuard)
  @Query('user')
  getUser(id: number) {
    return this.appService.findOneUser({ id });
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('deleteUser')
  deleteUser(@Args('id', ParseIntPipe) id: number) {
    return this.appService.removeOneUser(id);
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('updateActivity')
  updateActivity(@Args('id') id: number, @Args('active') active: boolean) {
    return this.appService.updateUserActivity({
      id: +id,
      updateUserActivityDto: { active },
    });
  }

  @UseGuards(AuthGuard)
  @Mutation('updateUser')
  updateUser(@Args('id') id: string, @Args('password') password: string) {
    return this.appService.updateUser({ id: +id, updateUserDto: { password } });
  }
}

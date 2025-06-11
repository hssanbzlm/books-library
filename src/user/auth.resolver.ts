import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { currentUser } from '../decorators/current-user/gql-current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Boolean)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context,
  ) {
    const { req } = context;
    const user = await this.authService.signin(email, password);
    if (!user) {
      return {};
    }
    req.session.userId = user.id;
    return user;
  }
  
  @UseGuards(AdminAuthGuard)
  @Mutation('signup')
  signup(@Args('user') user :CreateUserDto){
    return this.authService.signup(user)
  }
  
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async logout(@Context() context) {
    const {req} = context;
    req.session.userId = null;
    return true
  }

  @UseGuards(AuthGuard)
  @Query('whoami')
  whoami(@currentUser() user: User) {
    return user;
  }
}

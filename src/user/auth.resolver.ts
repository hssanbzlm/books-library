import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { currentUser } from '../decorators/current-user/gql-current-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { AuthGuard } from 'src/guards/gql-auth.guard';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { AdminAuthGuard } from 'src/guards/gql-admin.guard';
import { AppService } from 'src/app.service';
import { lastValueFrom } from 'rxjs';
import { plainToInstance } from 'class-transformer';

@Resolver()
export class AuthResolver {
  constructor(private readonly appService: AppService) {}

  @Mutation(() => User)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context,
  ) {
    const { req } = context;
    const user = await lastValueFrom(
      this.appService.signin({ email, password }),
    );

    req.session.userId = user.id;

    // with plainToInstance used explicitly, there is no need to use classSerializeInterceptor
    // returned result will automatically apply @exclude on password
    const userInstance = plainToInstance(User, user);
    return userInstance;
  }

  @Mutation('signup')
  signup(@Args('user') user: CreateUserDto) {
    return this.appService.signup(user);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async logout(@Context() context) {
    const { req } = context;
    req.session.userId = null;
    return true;
  }

  @UseGuards(AuthGuard)
  @Query('whoami')
  async whoami(@currentUser() user: User) {
    const authUser = await lastValueFrom(this.appService.whoami(user));
    const plainAuthUser = plainToInstance(User, authUser);
    return plainAuthUser;
  }
}

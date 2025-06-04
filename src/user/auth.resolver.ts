import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { currentUser } from '../decorators/current-user/gql-current-user.decorator';
import { User } from './entities/user.entity';

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
      return false;
    }
    req.session.userId = user.id;
    return true
  }

  @Query('whoami')
  whoami(@currentUser() user: User){
    return user;

  }
}

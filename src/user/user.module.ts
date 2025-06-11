import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthResolver } from './auth.resolver';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService,UserResolver,AuthResolver],
})
export class UserModule {}

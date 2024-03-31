import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from 'src/guards/auth-guard.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateUserActivity } from './dtos/update-user-activity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch('update-activity/:id')
  updateActivity(
    @Param('id') id: string,
    @Body() updateUserActivityDto: UpdateUserActivity,
  ) {
    return this.userService.updateActivity(+id, updateUserActivityDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
}

import { UseGuards, Post, Body, Patch, Get, Controller } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { currentUser } from 'src/decorators/current-user/current-user.decorator';
import { AuthGuard } from 'src/guards/auth-guard.guard';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { UserToBookService } from './user-to-book.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateBorrowBookDto } from './dto/update-borrow-book.dto';

@Controller('user-to-book')
export class UserToBookController {
  constructor(private userToBookService: UserToBookService) {}

  @UseGuards(AdminGuard)
  @Get()
  getAllList() {
    return this.userToBookService.getBorrowList();
  }

  @UseGuards(AuthGuard)
  @Get('borrow-list')
  getMyList(@currentUser() currentUser: User) {
    return this.userToBookService.getBorrowList(currentUser.id);
  }

  @UseGuards(AuthGuard)
  @Post('borrow')
  borrowBook(@Body() body: BorrowBookDto, @currentUser() currentUser: User) {
    return this.userToBookService.borrow(body, currentUser);
  }

  @UseGuards(AdminGuard)
  @Patch('borrow-status')
  updateBorrowStatus(@Body() body: UpdateBorrowBookDto) {
    return this.userToBookService.updateBorrowStatus(
      body.borrowId,
      body.status,
    );
  }
}

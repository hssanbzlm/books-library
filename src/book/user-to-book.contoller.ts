import {
  UseGuards,
  Post,
  Body,
  Patch,
  Get,
  Controller,
  Sse,
  ParseIntPipe,
  Param,
  Put,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { currentUser } from 'src/decorators/current-user/current-user.decorator';
import { AuthGuard } from 'src/guards/auth-guard.guard';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { UserToBookService } from './user-to-book.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateBorrowBookDto } from './dto/update-borrow-book.dto';
import { Observable } from 'rxjs';
import { BorrowNotificationService } from './borrow-notification/borrow-notification.service';
import { UpdateNotifSeenDto } from './dto/update-notif-seen.dto';

@Controller('user-to-book')
export class UserToBookController {
  constructor(
    private userToBookService: UserToBookService,
    private borrowNotificationService: BorrowNotificationService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  getAllList(@currentUser() currentUser: User) {
    if (currentUser.admin) return this.userToBookService.getBorrowList();
    return this.userToBookService.getBorrowList({ userId: currentUser.id });
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
  @Sse('borrow-notification/user-notif/:userId')
  getUserBorrowNotification(
    @Param('userId', ParseIntPipe) userId: number,
  ): Observable<any> {
    return this.borrowNotificationService.subscribeForUserNotification(userId);
  }

  @Sse('borrow-notification/admin-notif/:adminId')
  getAdminBorrowNotification(): Observable<any> {
    return this.borrowNotificationService.subscribeForAdminNotification();
  }

  @Get('notifications')
  getMissedNotification(@currentUser() currentUser: User) {
    const userRole = currentUser.admin ? 'admin' : 'user';
    return this.borrowNotificationService.getNotificationsStatus(
      currentUser.id,
      userRole,
    );
  }

  @Put('notifications-seen')
  updateNotificationSeend(@Body() body: UpdateNotifSeenDto) {
    return this.borrowNotificationService.notificationSeen(body.notifications);
  }
}

import {
  Controller,
  Param,
  ParseIntPipe,
  Sse,
  Get,
  Body,
  Put,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BorrowNotificationService } from 'src/notifications/borrow-notification.service';
import { UpdateNotifSeenDto } from 'src/book/dto/update-notif-seen.dto';
import { currentUser } from 'src/decorators/current-user/current-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private borrowNotificationService: BorrowNotificationService) {}

  @Sse('borrow-notification/user-notif/:userId')
  getUserBorrowNotification(
    @Param('userId', ParseIntPipe) userId: number,
  ): Observable<any> {
    return this.borrowNotificationService.subscribeForUserNotification(userId);
  }

  @Get()
  getMissedNotification(@currentUser() currentUser: User) {
    return this.borrowNotificationService.getNotificationsStatus(
      currentUser.id,
    );
  }

  @Put('notifications-seen')
  updateNotificationSeend(@Body() body: UpdateNotifSeenDto) {
    return this.borrowNotificationService.notificationSeen(body.notifications);
  }
}

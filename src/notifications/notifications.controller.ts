import {
  Controller,
  Param,
  ParseIntPipe,
  Sse,
  Get,
  Body,
  Put,
  Req,
} from '@nestjs/common';
import { fromEvent, map, Observable, takeUntil, tap } from 'rxjs';
import { BorrowNotificationService } from 'src/notifications/borrow-notification.service';
import { UpdateNotifSeenDto } from 'src/book/dto/update-notif-seen.dto';
import { currentUser } from 'src/common/decorators/current-user/current-user.decorator';
import { User } from 'src/common/entities/user.entity';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private borrowNotificationService: BorrowNotificationService) {}

  @Sse('borrow-notification/user-notif/:userId')
  getUserBorrowNotification(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ): Observable<any> {
    const close$ = fromEvent(req, 'close').pipe(
      tap(() => console.log(`Client ${userId} disconnected`)),
    );
    return this.borrowNotificationService.listenToUser(userId).pipe(
      takeUntil(close$),
      map((notif) => ({ data: notif })),
    );
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

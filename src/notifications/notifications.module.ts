import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { BorrowNotificationService } from './borrow-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToBook } from 'src/book/entities/userToBook';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserToBook,Notification])],
  controllers: [NotificationsController],
  providers: [BorrowNotificationService],
  exports:[BorrowNotificationService]
})
export class NotificationsModule {}

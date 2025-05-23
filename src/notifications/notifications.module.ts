import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { BorrowNotificationService } from './borrow-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToBook } from 'src/book/entities/userToBook';

@Module({
  imports: [TypeOrmModule.forFeature([UserToBook])],
  controllers: [NotificationsController],
  providers: [BorrowNotificationService],
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { BorrowNotificationService } from './borrow-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToBook } from 'src/book/entities/userToBook';
import { Notification } from './entities/notification.entity';
import { RedisModule } from '../redis/redis.module'
import { User } from '../common/entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([UserToBook,Notification,User]),RedisModule],
  controllers: [NotificationsController],
  providers: [BorrowNotificationService],
  exports:[BorrowNotificationService]
})
export class NotificationsModule {}

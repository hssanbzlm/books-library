import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BorrowNotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private redisService:RedisService
  ) {}
 
   async sendToUser(userId: number, notification: any) {
    await this.redisService.publish(`user:${userId}`, notification);
  }

  listenToUser(userId: number): Observable<any> {
    return new Observable((observer) => {
      const channel = `user:${userId}`;
      this.redisService.subscribe(channel, (message) => {
        observer.next(message);
      });
    });
  }

  public async getNotificationsStatus(userId: number) {
    const notifList = await this.notificationRepository.find({
      where: {
        receiver: { id: userId },
      },
      select: {
        message: true,
        date: true,
        receiverSeen: true,
        id:true,
      },
    });
    return notifList;
  }

  async notificationSeen(notifications: number[]) {
    try {
      const result = await this.notificationRepository
        .createQueryBuilder()
        .update()
        .set({
          receiverSeen: true,
        })
        .where({ id: In(notifications) })
        .execute();
      return result;
    } catch (e) {}
  }
}

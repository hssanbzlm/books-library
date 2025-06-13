import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { filter, Subject } from 'rxjs';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class BorrowNotificationService {
  userNotifcations$ = new Subject<{ data: Notification }>();
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}
  @OnEvent('userNotif.userToBook.changes')
  private userNotifChanges(payload: Notification) {
    this.userNotifcations$.next({ data: payload });
  }

  public subscribeForUserNotification(userId: number) {
    return this.userNotifcations$.pipe(
      filter(({ data }) => data.receiver.id == userId),
    );
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

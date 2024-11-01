import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { filter, Subject } from 'rxjs';
import { UserToBook } from '../entities/userToBook';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BorrowNotificationService {
  userNotifcations$ = new Subject<{ data: UserToBook }>();
  adminNotifications$ = new Subject<{ data: UserToBook }>();
  constructor(
    @InjectRepository(UserToBook)
    private userToBookRepository: Repository<UserToBook>,
  ) {}
  @OnEvent('userNotif.userToBook.changes')
  private userNotifChanges(payload: UserToBook) {
    this.userNotifcations$.next({ data: payload });
  }

  @OnEvent('adminNotif.userToBook.changes')
  private adminNotifChanges(payload: UserToBook) {
    this.adminNotifications$.next({ data: payload });
    console.log('new admin notif data ', payload);
  }

  public subscribeForUserNotification(userId: number) {
    return this.userNotifcations$.pipe(
      filter(({ data }) => data.userId == userId),
    );
  }

  public subscribeForAdminNotification() {
    return this.adminNotifications$.pipe(
      filter(({ data }) => data.receiverRole == 'admin'),
    );
  }
  public async getNotificationsStatus(userId: number, role: 'admin' | 'user') {
    const notifList = await this.userToBookRepository.find({
      where: {
        ...(role == 'user' && { userId }),
        receiverRole: role,
        receiverSeen: false,
      },
      relations: { book: true, user: true },
      select: {
        userToBookId: true,
        startDate: true,
        endDate: true,
        status: true,
        receiverSeen: true,
        user: {
          id: true,
          email: true,
          name: true,
          lastName: true,
        },
        book: {
          id: true,
          title: true,
        },
      },
    });
    return notifList.map((userToBook) => ({
      userToBookId: userToBook.userToBookId,
      status: userToBook.status,
      userId: userToBook.user.id,
      userName: userToBook.user.name,
      userLastName: userToBook.user.lastName,
      email: userToBook.user.email,
      bookId: userToBook.book.id,
      bookTitle: userToBook.book.title,
      endDate: userToBook.endDate,
      startDate: userToBook.startDate,
      receiverSeen: userToBook.receiverSeen,
    }));
  }

  async notificationSeen(
    userRole: 'admin' | 'user',
    userId: number,
    notifications: number[],
  ) {
    try {
      const result = await this.userToBookRepository
        .createQueryBuilder()
        .update()
        .set({
          receiverSeen: true,
        })
        .where({ userToBookId: In(notifications) })
        .execute();
      return result;
    } catch (e) {}
  }
}

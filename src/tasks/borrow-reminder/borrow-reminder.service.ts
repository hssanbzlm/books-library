import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserToBookService } from 'src/book/user-to-book.service';

@Injectable()
export class BorrowReminderService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private userToBookService: UserToBookService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_11AM, { name: 'send reminder' })
  async sendReminder() {
    const data = await this.userToBookService.borrowList();
    for (const [key, value] of Object.entries(data)) {
      const email = key;
      const books = value as string[];
      const content = `We are sending you this email to remind you that you have to bring back: ${books.join(' , ')}`;
      try {
        await this.mailerService.sendMail({
          to: email,
          from: this.configService.get<string>('EMAIL_REMINDER'),
          text: content,
          subject: 'Borrow book reminder',
        });
      } catch (err) {
        console.log('err', err);
      }
    }
  }
}

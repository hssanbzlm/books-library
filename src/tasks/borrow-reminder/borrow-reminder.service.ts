import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BorrowReminderService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendReminder(to: string, content: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: this.configService.get<string>('EMAIL_REMINDER'),
        text: content,
        subject: 'Borrow book reminder',
      });
    } catch (err) {
      console.log('err', err);
    }
  }
}

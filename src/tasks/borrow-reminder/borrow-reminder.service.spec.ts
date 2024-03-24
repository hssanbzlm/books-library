import { Test, TestingModule } from '@nestjs/testing';
import { BorrowReminderService } from './borrow-reminder.service';

describe('BorrowReminderService', () => {
  let service: BorrowReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowReminderService],
    }).compile();

    service = module.get<BorrowReminderService>(BorrowReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

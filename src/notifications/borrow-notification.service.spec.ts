import { Test, TestingModule } from '@nestjs/testing';
import { BorrowNotificationService } from '../borrow-notification.service';

describe('BorrowNotificationService', () => {
  let service: BorrowNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowNotificationService],
    }).compile();

    service = module.get<BorrowNotificationService>(BorrowNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

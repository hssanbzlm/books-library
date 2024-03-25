import { Test, TestingModule } from '@nestjs/testing';
import { UserToBookService } from './user-to-book.service';

describe('UserToBookService', () => {
  let service: UserToBookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserToBookService],
    }).compile();

    service = module.get<UserToBookService>(UserToBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

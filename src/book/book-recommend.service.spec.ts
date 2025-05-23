import { Test, TestingModule } from '@nestjs/testing';
import { BookRecommendService } from './book-recommend.service';

describe('BookRecommendService', () => {
  let service: BookRecommendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookRecommendService],
    }).compile();

    service = module.get<BookRecommendService>(BookRecommendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

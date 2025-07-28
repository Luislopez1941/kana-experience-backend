import { Test, TestingModule } from '@nestjs/testing';
import { YachtService } from './yacht.service';

describe('YachtService', () => {
  let service: YachtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YachtService],
    }).compile();

    service = module.get<YachtService>(YachtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

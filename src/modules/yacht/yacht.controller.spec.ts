import { Test, TestingModule } from '@nestjs/testing';
import { YachtController } from './yacht.controller';
import { YachtService } from './yacht.service';

describe('YachtController', () => {
  let controller: YachtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YachtController],
      providers: [YachtService],
    }).compile();

    controller = module.get<YachtController>(YachtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

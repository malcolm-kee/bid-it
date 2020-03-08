import { Test, TestingModule } from '@nestjs/testing';
import { DealDataService } from './deal-data.service';

describe('DealDataService', () => {
  let service: DealDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DealDataService],
    }).compile();

    service = module.get<DealDataService>(DealDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { QuestionVotedService } from './question-voted.service';

describe('QuestionVotedService', () => {
  let service: QuestionVotedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionVotedService],
    }).compile();

    service = module.get<QuestionVotedService>(QuestionVotedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

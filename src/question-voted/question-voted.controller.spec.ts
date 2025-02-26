import { Test, TestingModule } from '@nestjs/testing';
import { QuestionVotedController } from './question-voted.controller';

describe('QuestionVotedController', () => {
  let controller: QuestionVotedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionVotedController],
    }).compile();

    controller = module.get<QuestionVotedController>(QuestionVotedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

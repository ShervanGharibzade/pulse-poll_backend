import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionVotedDto } from 'src/dto/question-voted';
import { QuestionVoted } from 'src/entities/questionVoted.entity';
import { QuestionService } from 'src/question/question.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionVotedService {
  constructor(
    @InjectRepository(QuestionVoted)
    private QVRepository: Repository<QuestionVoted>,
    private userService: UserService,
    private questionService: QuestionService,
  ) {}

  async getVoters(qID: number): Promise<string[]> {
    const voters = await this.QVRepository.find({
      where: { question_id: qID },
    });

    const voters_info = await Promise.all(
      voters.map((voter) => this.userService.findById(voter.user_id)),
    );

    return voters_info.map((voter) => voter.username);
  }

  async saveQuestionVote(question: QuestionVotedDto) {
    await this.QVRepository.save(question);
  }

  async userVoteHistory(user_id: number) {
    const votes = await this.QVRepository.find({
      where: { voter_id: user_id },
    });

    const questions = await Promise.all(
      votes.map((vote) =>
        this.questionService.findQuestionById(vote.question_id),
      ),
    );

    const user_answers = questions.flatMap((q) =>
      q.answers.filter((a) => votes.some((v) => v.answer_id === a.id)),
    );

    return { questions, user_answers };
  }
}

import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
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

    @Inject(forwardRef(() => QuestionService))
    private questionService: QuestionService,
  ) {}

  async getVoters(
    qID: number,
  ): Promise<{ username: string; answer: number }[]> {
    const voters = await this.QVRepository.find({
      where: { question_id: qID },
    });

    const voters_info = await Promise.all(
      voters.map(async (voter) => ({
        username: (await this.userService.findById(voter.user_id)).username,
        answer: voter.answer_id,
      })),
    );

    return voters_info;
  }

  async hasUserVoted(voterId: number, questionId: number): Promise<boolean> {
    if (!voterId || isNaN(voterId)) {
      throw new HttpException('Invalid voter ID', HttpStatus.BAD_REQUEST);
    }

    const vote = await this.QVRepository.findOne({
      where: { voter_id: voterId, question_id: questionId },
    });

    return !!vote;
  }

  async saveQuestionVote(question: QuestionVotedDto) {
    await this.QVRepository.save(question);
  }

  async findQuestionPublished(id: number) {
    const p = await this.QVRepository.findOne({
      where: { question_id: id },
    });
    const question = await this.questionService.findQuestionById(p.question_id);
    return question;
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

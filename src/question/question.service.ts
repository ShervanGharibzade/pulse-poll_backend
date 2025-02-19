import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { CreateQuestionDto } from 'src/auth/dto/create-question';
import { User } from 'src/entities/user.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly jwtService: JwtService,
  ) {}

  async getUserQuestions(token: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { token: token },
      });
      return await this.questionRepository.find({
        where: { user: { id: user.id } },
        relations: ['answers'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getQuestionById(qId: number, token: string) {
    const user = await this.userRepository.findOne({ where: { token: token } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = await this.questionRepository.findOne({
      where: { id: qId, user: { id: user.id } },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async createQuestionAndAnswers(
    token: string,
    createQuestionDto: CreateQuestionDto,
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { token: token },
      });

      const newQuestion = this.questionRepository.create({
        text: createQuestionDto.Question,
        user: { id: user.id },
      });

      const savedQuestion = await this.questionRepository.save(newQuestion);

      const answers = createQuestionDto.Answers.map((answer) =>
        this.answerRepository.create({
          text: answer.text,
          isCurrect: answer.isCurrect,
          votePortion: answer.votePortion,
          question: savedQuestion,
        }),
      );

      await this.answerRepository.save(answers);

      return { ...savedQuestion, answers };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating question: ${error.message}`,
      );
    }
  }
}

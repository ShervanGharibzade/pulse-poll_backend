import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt'; // Optional, for token validation
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { CreateQuestionDto } from 'src/auth/dto/create-question';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly jwtService: JwtService,
  ) {}

  async getAllQuestions() {
    try {
      return await this.questionRepository.find({
        relations: ['answers'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getQuestionById(id: number) {
    const question = await this.questionRepository.findOne({
      where: { id },
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
      const decodedToken = this.jwtService.verify(token);
      if (!decodedToken) {
        throw new Error('Invalid token');
      }

      const newQuestion = this.questionRepository.create({
        text: createQuestionDto.Question,
        answers: createQuestionDto.Answers,
      });

      const savedQuestion = await this.questionRepository.save(newQuestion);

      const answers = createQuestionDto.Answers.map((answer) => {
        const newAnswer = this.answerRepository.create({
          text: answer.text,
          isCurrect: answer.isCurrect,
          votePortion: answer.votePortion,
        });
        return newAnswer;
      });

      await this.answerRepository.save(answers);

      return savedQuestion;
    } catch (error) {
      throw new Error(`Error creating question: ${error.message}`);
    }
  }
}

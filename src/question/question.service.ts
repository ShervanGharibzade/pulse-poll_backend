import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { CreateQuestionDto } from 'src/dto/create-question';
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

  async getUserQuestionsPublished(token: string): Promise<Question[]> {
    const user = await this.userRepository.findOne({ where: { token } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const questions = await this.questionRepository.find({
      where: { user, is_publish: true },
      relations: ['answers'],
    });

    if (!questions.length) {
      throw new NotFoundException('No published questions found for this user');
    }

    return questions;
  }

  async questionVoting(token: string): Promise<Question[]> {
    const user = await this.userRepository.findOne({ where: { token } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const questions = await this.questionRepository.find({
      where: { user, is_publish: true },
      relations: ['answers'],
    });

    if (!questions.length) {
      throw new NotFoundException('No published questions found for this user');
    }

    return questions;
  }

  async updateIsPublish(uid: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { uid },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    question.is_publish = true;

    return await this.questionRepository.save(question);
  }

  async updateVoteQuestion(uid: string, aId: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { uid },
      relations: ['answers'],
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const answer = question.answers.find((a) => a.id === aId);

    if (!answer) {
      throw new Error('Answer not found');
    }

    answer.votePortion += 1;

    return await this.questionRepository.save(question);
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

  async getQuestionByUid(uid: string, token: string) {
    const user = await this.userRepository.findOne({ where: { token: token } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = await this.questionRepository.findOne({
      where: { uid: uid, user: { id: user.id } },
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

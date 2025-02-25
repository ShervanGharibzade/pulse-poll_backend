import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
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

  async getUserQuestionsPublished(): Promise<Question[]> {
    const questions = await this.questionRepository.find({
      where: { is_publish: true },
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
    const logger = new Logger('QuestionService');

    // Retrieve the question and its answers from the database
    const question = await this.questionRepository.findOne({
      where: { uid },
      relations: ['answers'],
    });

    // Check if the question exists
    if (!question) {
      const errorMessage = `Question with uid ${uid} not found`;
      logger.error(errorMessage);
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    // Find the answer by ID
    const answer = question.answers.find((a) => a.id === aId);
    if (!answer) {
      const errorMessage = `Answer with ID ${aId} not found for question ${uid}`;
      logger.error(errorMessage);
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    // Update the vote count for the answer
    try {
      answer.votePortion = (answer.votePortion || 0) + 1;

      // Save the updated vote count using a query builder
      await this.questionRepository
        .createQueryBuilder()
        .update('answer')
        .set({ votePortion: answer.votePortion })
        .where('id = :aId', { aId })
        .execute();

      logger.log(
        `Successfully updated vote count for answer ID ${aId} on question ${uid}`,
      );
      return question;
    } catch (error) {
      const errorMessage = `Failed to update vote count for answer ID ${aId} on question ${uid}`;
      logger.error(errorMessage, error.stack);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
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

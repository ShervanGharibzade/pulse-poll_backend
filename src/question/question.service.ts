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

<<<<<<< Updated upstream
  async createQuestion(token: string, text: string): Promise<Question> {
    // Find the user by ID
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) {
      throw new Error('User not found');
    }

    // Create the question
    const question = this.questionRepository.create({ text, user });

    // Save and return the question
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(token: string, questionId: number): Promise<void> {
    // Find the user by token
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) {
      throw new Error('User not found');
    }

    // Find the question by ID and ensure it belongs to the user
    const question = await this.questionRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!question) {
      throw new Error(
        'Question not found or you do not have permission to delete it',
      );
    }

    // Delete the question
    await this.questionRepository.remove(question);
  }

  async editQuestion(
    token: string,
    questionId: number,
    newText: string,
  ): Promise<Question> {
    // Find the user by token
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) {
      throw new Error('User not found');
    }

    // Find the question by ID and ensure it belongs to the user
    const question = await this.questionRepository.findOne({
      where: { id: questionId, user: { id: user.id } },
    });
    if (!question) {
      throw new Error(
        'Question not found or you do not have permission to edit it',
      );
    }

    // Update the question text
    question.text = newText;
    return await this.questionRepository.save(question);
  }

  async createAnswer(
    questionId: number,
    text: string,
    isCorrect: boolean = false,
    votePortion: number = 0,
  ): Promise<Answer> {
    // Find the question by ID
=======
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
>>>>>>> Stashed changes
    const question = await this.questionRepository.findOne({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

<<<<<<< Updated upstream
    // Create the answer
    const answer = this.answerRepository.create({
      text,
      isCorrect,
      vote_portion: votePortion,
      question, // Associate the answer with the question
    });

    // Save and return the answer
    return await this.answerRepository.save(answer);
  }
  async deleteAnswer(answerId: number): Promise<void> {
    // Find the answer by ID
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });
    if (!answer) {
      throw new Error('Answer not found');
    }

    // Delete the answer
    await this.answerRepository.remove(answer);
  }

  async editAnswer(
    answerId: number,
    newText: string,
    isCorrect?: boolean,
    votePortion?: number,
  ): Promise<Answer> {
    // Find the answer by ID
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });
    if (!answer) {
      throw new Error('Answer not found');
    }

    // Update the answer fields
    answer.text = newText;
    if (isCorrect !== undefined) {
      answer.isCorrect = isCorrect;
    }
    if (votePortion !== undefined) {
      answer.vote_portion = votePortion;
    }

    // Save and return the updated answer
    return await this.answerRepository.save(answer);
=======
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
>>>>>>> Stashed changes
  }
}

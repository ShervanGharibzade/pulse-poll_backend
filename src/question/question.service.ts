import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/entities/answer.entity';
import { Question } from 'src/entities/question.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createQuestion(userId: number, text: string): Promise<Question> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const question = this.questionRepository.create({ text, user });
    return await this.questionRepository.save(question);
  }

  async addAnswer(questionId: number, text: string): Promise<Answer> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new Error('Question not found');
    }

    const answer = this.answerRepository.create({ text, question });
    return await this.answerRepository.save(answer);
  }
}

import { Controller, Post, Body, Param } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('create')
  async createQuestion(@Body() body: { userId: number; text: string }) {
    return this.questionService.createQuestion(body.userId, body.text);
  }

  @Post(':id/answer')
  async addAnswer(
    @Param('id') questionId: number,
    @Body() body: { text: string },
  ) {
    return this.questionService.addAnswer(questionId, body.text);
  }
}

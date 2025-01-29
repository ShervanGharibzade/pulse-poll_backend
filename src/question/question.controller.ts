import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
  NotFoundException,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { AuthGuard } from 'src/auth/authGuard';

@Controller('/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // Create a new question
  @Post('create')
  @UseGuards(AuthGuard)
  async createQuestion(@Req() req: Request, @Body() body: { text: string }) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new HttpException(
        'Invalid authorization format',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.questionService.createQuestion(token, body.text);
  }

  // Add an answer to a question
  @Post(':id/answer')
  @UseGuards(AuthGuard)
  async addAnswer(
    @Param('id') questionId: number,
    @Body() body: { text: string; isCorrect?: boolean; votePortion?: number },
  ) {
    return this.questionService.createAnswer(
      questionId,
      body.text,
      body.isCorrect,
      body.votePortion,
    );
  }

  // Delete an answer
  @Delete(':questionId/answer/:answerId')
  @UseGuards(AuthGuard)
  async deleteAnswer(
    @Param('questionId') questionId: number,
    @Param('answerId') answerId: number,
  ) {
    try {
      await this.questionService.deleteAnswer(answerId);
      return { message: 'Answer deleted successfully' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // Edit an answer
  @Patch(':questionId/answer/:answerId')
  @UseGuards(AuthGuard)
  async editAnswer(
    @Param('questionId') questionId: number,
    @Param('answerId') answerId: number,
    @Body() body: { text?: string; isCorrect?: boolean; votePortion?: number },
  ) {
    try {
      return await this.questionService.editAnswer(
        answerId,
        body.text,
        body.isCorrect,
        body.votePortion,
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

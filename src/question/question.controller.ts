import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Headers,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { AuthGuard } from 'src/auth/authGuard';
import { CreateQuestionDto } from 'src/auth/dto/create-question';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getUserQuestions(@Headers('authorization') authHeader: string) {
    try {
      const token = authHeader?.split(' ')[1];
      console.log(token);

      return await this.questionService.getUserQuestions(token);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: number) {
    try {
      return await this.questionService.getQuestionById(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async createQuestion(
    @Headers('authorization') authHeader: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new HttpException(
        'Invalid authorization format',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.questionService.createQuestionAndAnswers(
      token,
      createQuestionDto,
    );
  }
}

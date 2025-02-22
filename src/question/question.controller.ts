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
  UnauthorizedException,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { AuthGuard } from 'src/auth/authGuard';
import { CreateQuestionDto } from 'src/dto/create-question';
import { validateToken } from 'src/custom-validator/custom_validator';

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
  async getQuestionById(
    @Param('id') id: number,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      const token = authHeader?.split(' ')[1];
      return await this.questionService.getQuestionById(id, token);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('/published/questions')
  async publishQuestionList(@Headers('authorization') authHeader: string) {
    try {
      const token = authHeader?.split(' ')[1];

      const questions =
        await this.questionService.getUserQuestionsPublished(token);
      return questions;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('/publish/:uid')
  async publishQuestion(
    @Param('uid') uid: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      await this.questionService.updateIsPublish(uid);

      return {
        massage: 'The question has been successfully published.',
        status: 201,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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

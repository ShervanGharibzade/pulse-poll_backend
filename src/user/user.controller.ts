import {
  Controller,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/info')
  // @UseGuards(AuthGuard)
  async getUserInfo(
    @Req() req: Request,
  ): Promise<{ username: string; email: string }> {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        throw new HttpException(
          'Authorization token is missing',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authHeader.split(' ')[1];
      console.log(token);

      if (!token) {
        throw new HttpException(
          'Invalid authorization format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const tt = await this.userService.findAllUsersWithTokens();
      console.log(tt);
      const user = await this.userService.findByToken(token);

      if (!user) {
        throw new HttpException(
          'User not found or invalid token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

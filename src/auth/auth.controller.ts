import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Delete,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UserService } from 'src/user/user.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ token: string }> {
    try {
      const token = await this.authService.signup(createUserDto);
      return {
        token,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('signout')
  async signout(
    @Headers('authorization') token: string,
  ): Promise<{ success: boolean; message: string }> {
    const authToken = token?.replace('Bearer ', '');

    if (!authToken) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      await this.authService.signout(authToken);
      return { success: true, message: 'Signout successfully done' };
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred during signout',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ token: string }> {
    try {
      const token = await this.authService.login(loginUserDto);
      return { token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto.email);
      return { message: 'Password successfully reset' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

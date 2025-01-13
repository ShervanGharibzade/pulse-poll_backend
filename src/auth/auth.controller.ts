import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }): string {
    const { username, password } = body;
    const isValid = this.authService.validateUser(username, password);
    if (isValid) {
      return 'successfully logged in';
    }
    return 'invalid username or password';
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<string> {
    const { username, password } = loginUserDto;

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign(username);
    return token;
  }

  async signup(createUserDto: CreateUserDto): Promise<string> {
    const { username, password, email } = createUserDto;

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userService.create({
      username,
      password: hashedPassword,
      email: email,
    });

    const token = this.jwtService.sign(user.username);

    return token;
  }

  async signout(token: string): Promise<string> {
    const username = await this.jwtService.decode(token);
    const user = await this.userService.findByUsername(username);
    console.log(user);

    // TODO:create blackList for tokens

    return 'signout successfully done';
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return; // Do not reveal if the email exists
    }

    const token = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '365d' },
    );

    // Send email logic (pseudo-code)
    console.log(`Send email to ${email} with token: ${token}`);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }
      // TODO: you most send code for reset password
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}

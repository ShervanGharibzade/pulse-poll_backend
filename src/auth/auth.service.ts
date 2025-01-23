import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // Injecting UserService
    private readonly jwtService: JwtService, // Injecting JwtService
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

    const payload = { username: user.username, userId: user.id };
    return this.jwtService.sign(payload);
  }

  async signup(createUserDto: CreateUserDto): Promise<string> {
    const { username, password } = createUserDto;

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userService.create({
      username,
      password: hashedPassword,
    });

    await this.userService.save(user);

    const payload = { username: user.username, userId: user.id };

    return this.jwtService.sign(payload);
  }
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return; // Do not reveal if the email exists
    }

    const token = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '1h' },
    );

    // Save the token in the database or use a field like `resetToken`
    await this.userService.updateUserRefreshToken(user.id, token);

    // Send email logic (pseudo-code)
    console.log(`Send email to ${email} with token: ${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token); // Verify the token
      const user = await this.userService.findById(payload.userId);

      if (!user || user.token !== token) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token
      await this.userService.updateUserPassword(user.id, hashedPassword);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}

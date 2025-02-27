import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });

    try {
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }

  async findByToken(token: string): Promise<User | null> {
    const username = await this.jwtService.decode(token);
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findAllUsersWithTokens(): Promise<{ username: string }[]> {
    try {
      const users = await this.userRepository.find({
        select: ['username'],
      });

      const usersWithTokens = users.map((user) => ({
        username: user.username,
      }));

      return usersWithTokens;
    } catch (error) {
      console.error(
        'Error fetching users with tokens:',
        error.message || error,
      );
      throw new Error('Unable to fetch users with tokens');
    }
  }

  create(userData: {
    username: string;
    password: string;
    email: string;
  }): User {
    const user = this.userRepository.create(userData);
    return user;
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;

    await this.userRepository.save(user);
  }

  async saveUser(user: CreateUserDto) {
    return await this.userRepository.save(user);
  }
}

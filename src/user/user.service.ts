import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findAllUsersWithTokens(): Promise<
    { username: string; token: string }[]
  > {
    try {
      // Query the database to get all users and their tokens
      const users = await this.userRepository.find({
        select: ['username', 'token'],
      });

      // Map the users to return only their username and token
      const usersWithTokens = users.map((user) => ({
        username: user.username,
        token: user.token,
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

  async updateUserToken(userId: string, newToken: string): Promise<void> {
    const user = await this.findById(Number(userId));

    if (!user) {
      throw new Error('User not found');
    }

    user.token = newToken;
<<<<<<< Updated upstream
    console.log(newToken, 'new');
=======
>>>>>>> Stashed changes

    await this.userRepository.save(user);
  }

  create(userData: {
    username: string;
    password: string;
    email: string;
    token: string;
  }): User {
    const user = this.userRepository.create(userData);
    return user;
  }
  async deleteAllUserData(): Promise<void> {
    try {
      // Delete all user records from the 'users' table
      await this.userRepository.clear(); // Clear all users from the database
      console.log('All user data has been deleted.');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete all user data.');
    }
  }
  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
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

  async updateUserRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.token = refreshToken;

    await this.userRepository.save(user);
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
}

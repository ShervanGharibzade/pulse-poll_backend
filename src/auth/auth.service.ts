import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly users = [
    { username: 'shervan', password: '123456' },
    { username: 'unknown', password: '654321' },
  ];
  validateUser(username: string, password: string): boolean {
    const user = this.users.find(
      (user) => user.password === password && user.username === username,
    );
    return !!user;
  }
}

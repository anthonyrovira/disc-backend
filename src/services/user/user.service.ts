import { Injectable } from '@nestjs/common';
import { User } from 'src/dtos/data/user/user.dto';

@Injectable()
export class UserService {
  private users: User[] = [];

  createUser(userData: User): User {
    const newUser = new User(userData.id, userData.name, userData.email);
    this.users.push(newUser);
    return newUser;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}

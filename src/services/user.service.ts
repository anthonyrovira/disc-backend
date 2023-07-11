import { Injectable } from '@nestjs/common';
import { User } from 'src/models/data/user.model';

@Injectable()
export class UserService {
  private users: User[] = [];

  createUser(userData: User): User {
    const newUser = new User(userData.id, userData.name, userData.email);
    this.users.push(newUser);
    return newUser;
  }
}

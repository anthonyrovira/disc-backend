import { User } from 'src/dtos/data/user/user.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const userData: User = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      const newUser: User = userService.createUser(userData);

      expect(newUser).toBeDefined();
      expect(newUser.id).toEqual(userData.id);
      expect(newUser.name).toEqual(userData.name);
      expect(newUser.email).toEqual(userData.email);
    });
  });

  describe('getUserById', () => {
    it('should return the user with the specified ID', () => {
      const userData: User = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      userService.createUser(userData);

      const user: User = userService.getUserById(userData.id);

      expect(user).toBeDefined();
      expect(user.id).toEqual(userData.id);
      expect(user.name).toEqual(userData.name);
      expect(user.email).toEqual(userData.email);
    });

    it('should return undefined if the user is not found', () => {
      const user: User = userService.getUserById('999');

      expect(user).toBeUndefined();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from 'src/services/user/user.service';
import { User } from 'src/dtos/data/user/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create a new user', () => {
    const userData: User = {
      id: '1',
      name: 'John Doe',
      email: 'johndoe@example.com',
    };

    jest.spyOn(userService, 'createUser').mockReturnValue(userData);

    const result = controller.createUser(userData);

    expect(userService.createUser).toHaveBeenCalledWith(userData);
    expect(result).toBe(userData);
  });

  it('should get a user by id', () => {
    const userId = '1';
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'johndoe@example.com',
    };

    jest.spyOn(userService, 'getUserById').mockReturnValue(user);

    const result = controller.getUserById(userId);

    expect(userService.getUserById).toHaveBeenCalledWith(userId);
    expect(result).toBe(user);
  });
});

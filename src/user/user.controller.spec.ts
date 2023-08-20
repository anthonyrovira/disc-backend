import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserDto } from 'src/core/dtos';

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('getUserById', () => {
    it('should return the user', () => {
      // Arrange
      const userDto: UserDto = { id: '123', email: 'user@example.com' };

      // Act
      const result = userController.getUserByAccessToken(userDto);

      // Assert
      expect(result).toBe(userDto);
    });
  });
});

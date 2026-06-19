import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            deleteUser: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should call deleteUser on deleteAccount', async () => {
    const mockUser = { id: 'uid', email: 'test@test.com' };

    await controller.deleteAccount(mockUser as any);

    expect(service.deleteUser).toHaveBeenCalledWith({ id: 'uid' });
  });

  it('should call updateProfile on updateProfile', async () => {
    const mockUser = { id: 'uid', email: 'test@test.com' };
    const mockDto = { firstName: 'John' };
    const mockUpdated = {
      id: 'uid',
      email: 'test@test.com',
      firstName: 'John',
      lastName: null,
      birthDate: null,
      created_at: null,
    };

    jest.spyOn(service, 'updateProfile').mockResolvedValue(mockUpdated as any);

    const result = await controller.updateProfile(mockUser as any, mockDto as any);

    expect(service.updateProfile).toHaveBeenCalledWith('uid', mockDto);
    expect(result).toBeInstanceOf(Object);
    expect(result.firstName).toBe('John');
  });
});

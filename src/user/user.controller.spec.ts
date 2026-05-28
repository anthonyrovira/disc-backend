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
});

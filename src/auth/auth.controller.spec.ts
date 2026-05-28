import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRequestDto, AuthResponseDto } from '@/core/dtos';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            googleLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should return tokens on successful signup', async () => {
      const authRequestDto: AuthRequestDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const expectedResponse: AuthResponseDto = {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 900,
      };
      authService.signUp = jest.fn().mockResolvedValue(expectedResponse);

      const result = await authController.signUp(authRequestDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signUp).toHaveBeenCalledWith(authRequestDto);
    });
  });

  describe('signIn', () => {
    it('should return tokens on successful signin', async () => {
      const authRequestDto: AuthRequestDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const expectedResponse: AuthResponseDto = {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 900,
      };
      authService.signIn = jest.fn().mockResolvedValue(expectedResponse);

      const result = await authController.signIn(authRequestDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signIn).toHaveBeenCalledWith(authRequestDto);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on refresh', async () => {
      const dto = { refresh_token: 'old-refresh' };
      const expectedResponse: AuthResponseDto = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 900,
      };
      authService.refresh = jest.fn().mockResolvedValue(expectedResponse);

      const result = await authController.refresh(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.refresh).toHaveBeenCalledWith('old-refresh');
    });
  });

  describe('logout', () => {
    it('should call logout with user id', async () => {
      const mockUser = { id: 'uid', email: 'test@test.com' };

      await authController.logout(mockUser as any);

      expect(authService.logout).toHaveBeenCalledWith('uid');
    });
  });
});

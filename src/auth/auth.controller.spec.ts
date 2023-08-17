import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRequestDto, AuthResponseDto } from 'src/core/dtos';

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
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should return JWT token on successful signup', async () => {
      const authRequestDto: AuthRequestDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const expectedResponse: AuthResponseDto = { access_token: 'fake-token' };
      authService.signUp = jest.fn().mockResolvedValue(expectedResponse);

      const result = await authController.signUp(authRequestDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signUp).toHaveBeenCalledWith(authRequestDto);
    });
  });

  describe('signIn', () => {
    it('should return JWT token on successful signin', async () => {
      const authRequestDto: AuthRequestDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const expectedResponse: AuthResponseDto = { access_token: 'fake-token' };
      authService.signIn = jest.fn().mockResolvedValue(expectedResponse);

      const result = await authController.signIn(authRequestDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signIn).toHaveBeenCalledWith(authRequestDto);
    });

    it('should set the response status to HttpStatus.OK', async () => {
      const authRequestDto: AuthRequestDto = {
        email: 'user@example.com',
        password: 'password',
      };
      authService.signIn = jest.fn();

      await authController.signIn(authRequestDto);

      expect(authService.signIn).toHaveBeenCalledWith(authRequestDto);
      expect(authService.signIn).toHaveBeenCalledWith(authRequestDto);
    });
  });
});

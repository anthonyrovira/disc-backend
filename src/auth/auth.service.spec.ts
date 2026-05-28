import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/framework/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as argon from 'argon2';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            generate: jest.fn(),
            rotate: jest.fn(),
            revokeAll: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  describe('signUp', () => {
    it('should create a new user and return tokens', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: 'userId', email: 'test@example.com' };
      const mockToken = 'mockAccessToken';
      const mockRefresh = 'mockRefreshToken';

      prismaService.user.create = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);
      refreshTokenService.generate = jest.fn().mockResolvedValue(mockRefresh);

      const result = await authService.signUp(mockDto);

      expect(result).toEqual({
        access_token: mockToken,
        refresh_token: mockRefresh,
        expires_in: 900,
      });
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '15m', secret: process.env.JWT_SECRET },
      );
      expect(refreshTokenService.generate).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw InternalServerErrorException if email already exists', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Unique constraint violation'));

      await expect(authService.signUp(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw other errors', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Some error'));

      await expect(authService.signUp(mockDto)).rejects.toThrow(Error);
    });
  });

  describe('signIn', () => {
    it('should return tokens if credentials are correct', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockedHash = await argon.hash(mockDto.password);
      const mockUser = {
        id: 'userId',
        email: 'test@example.com',
        hash: mockedHash,
      };
      const mockToken = 'mockAccessToken';
      const mockRefresh = 'mockRefreshToken';

      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);
      refreshTokenService.generate = jest.fn().mockResolvedValue(mockRefresh);

      const result = await authService.signIn(mockDto);

      expect(result).toEqual({
        access_token: mockToken,
        refresh_token: mockRefresh,
        expires_in: 900,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockDto.email },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '15m', secret: process.env.JWT_SECRET },
      );
      expect(refreshTokenService.generate).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw ForbiddenException if user not found', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(authService.signIn(mockDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user is Google-only', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockUser = {
        id: 'userId',
        email: 'test@example.com',
        hash: null,
      };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.signIn(mockDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(authService.signIn(mockDto)).rejects.toThrow(
        'Please sign in with Google.',
      );
    });

    it('should throw ForbiddenException if password is incorrect', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockedHash = await argon.hash('randomPassword');
      const mockUser = {
        id: 'userId',
        email: 'test@example.com',
        hash: mockedHash,
      };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.signIn(mockDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw other errors', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Some error'));

      await expect(authService.signIn(mockDto)).rejects.toThrow(Error);
    });
  });
});

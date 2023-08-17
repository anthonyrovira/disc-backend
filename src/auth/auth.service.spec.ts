import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/framework/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should create a new user and return a token', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: 'userId', email: 'test@example.com' };
      const mockToken = 'mockToken';

      prismaService.user.create = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);

      const result = await authService.signUp(mockDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '30m', secret: process.env.JWT_SECRET },
      );
    });

    it('should throw ForbiddenException if email already exists', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.create = jest
        .fn()
        .mockRejectedValue(new ForbiddenException('Account already exists'));

      await expect(authService.signUp(mockDto)).rejects.toThrow(
        ForbiddenException,
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
    it('should return a token if credentials are correct', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };
      const mockedHash = await argon.hash(mockDto.password);
      const mockUser = {
        id: 'userId',
        email: 'test@example.com',
        hash: mockedHash,
      };
      const mockToken = 'mockToken';

      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(mockToken);

      const result = await authService.signIn(mockDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockDto.email },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: '30m', secret: process.env.JWT_SECRET },
      );
    });

    it('should throw ForbiddenException if user not found', async () => {
      const mockDto = { email: 'test@example.com', password: 'password' };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(authService.signIn(mockDto)).rejects.toThrow(
        ForbiddenException,
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

  describe('signToken', () => {
    it('should sign a JWT token', async () => {
      const userId = 'user123';
      const email = 'user@example.com';
      const expectedToken = 'fake-token';

      const payload = { sub: userId, email };
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(expectedToken);

      const result = await authService.signToken(userId, email);

      expect(result).toEqual({ access_token: expectedToken });
      expect(signAsyncSpy).toHaveBeenCalledWith(payload, {
        expiresIn: '30m',
        secret: process.env.JWT_SECRET,
      });
    });
  });
});

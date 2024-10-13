import { JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from './authentication.guard';
import { User } from '../auth.schema';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;
  let model: Model<User>;

  const mockModelUser = {
    findById: jest.fn(),
  };

  const jwtMock = {
    verify: jest.fn(),
  };

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'kingsley',
    email: 'kingsleyokgeorge@gmail.com',
    password: 'helloooo',
    passwordConfirm: 'helloooo',
    role: 'user',
    active: true,
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest
        .fn()
        .mockReturnValue({ headers: { authorization: 'valid Token' } }),
    }),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        UnauthorizedException,
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockModelUser,
        },
      ],
    }).compile();

    model = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  
});

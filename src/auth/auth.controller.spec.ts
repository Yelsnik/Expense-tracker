import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Model } from 'mongoose';
import { User } from './auth.schema';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let model: Model<User>;
  let controller: AuthController;
  let service: AuthService;
  let throttleGuard: ThrottlerGuard;
  let jwtService: JwtService;

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'kingsley',
    email: 'kingsleyokgeorge@gmail.com',
    password: 'helloooo',
    passwordConfirm: 'helloooo',
    role: 'user',
    active: true,
  };

  let tokens = 'jwtToken';

  const final = {
    tokens,
    user: mockUser,
  };

  const json = {
    message: 'success',
    data: final,
  };

  let jsonMock = {
    json: jest.fn().mockImplementation(() => json),
  };

  let responseMock = {
    status: jest.fn().mockImplementation(() => jsonMock),
    json: jest.fn((x) => x),
  } as unknown as Response;

  let mockAuthService = {
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      name: 'Kingsley Okure',
      email: 'kingsleyokgeorge@gmail.com',
      password: 'helloooo',
      passwordConfirm: 'helloooo',
    };
    it('it should return a 201 response when successful', async () => {
      const result = await controller.signUp(signupDto, responseMock);

      console.log(result, {
        message: 'success',
        data: final,
      });

      expect(service.signUp).toHaveBeenCalled();
      expect(responseMock.status).toHaveBeenCalledWith(201);
      expect(result).toEqual({
        message: 'success',
        data: final,
      });
    });
  });
});

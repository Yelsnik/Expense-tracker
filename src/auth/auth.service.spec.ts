import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Connection, Model } from 'mongoose';
import { User, UserDocument, UserSchema } from './auth.schema';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
//import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserDto } from './dto/user.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  // let mongoConnection: Connection;
  let model: Model<User>;
  let jwtService: JwtService;
  let mailService: MailerService;
  let configService: ConfigService;

  const findMock = {
    select: jest.fn((x) => x),
  };
  const mockConfig = () => ({ get: () => undefined });
  const mockAuthService = {
    create: jest.fn(),
    findOne: jest.fn(),
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

  const mockUserSignIn = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'kingsley',
    email: 'kingsleyokgeorge@gmail.com',
    role: 'user',
    active: true,
  };

  const mockUserFunc = {
    mockUser,
    correctPassword: jest.fn(),
  };

  let tokens = 'jwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockAuthService,
        },

        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useFactory: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const userDto = {
      name: 'kingsley',
      email: 'kingsleyokgeorge@gmail.com',
      password: 'helloooo',
      passwordConfirm: 'helloooo',
    };
    it('it should return an object containing token and user', async () => {
      jest
        .spyOn(model, 'create')
        .mockResolvedValueOnce([mockUser as UserDocument]);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('jwtToken');

      const result = await service.signUp(userDto);
      const expectedResult = { tokens, user: [mockUser] };
      // console.log(result, expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should throw duplicate email entered', async () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      await expect(service.signUp(userDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    const signInDto = {
      email: 'kingsleyokgeorge@gmail.com',
      password: 'helloooo',
    };

    it('it should sign in a user and return a token and a user', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockResolvedValueOnce([mockUser as UserDocument]);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(true));

      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('jwtToken');

      const result = await service.signIn(signInDto);
      console.log(result, { tokens, user: [mockUser] });
      expect(result).toEqual({ tokens, user: [mockUser] });
    });

    /*
    it('it should throw an unauthorized exception where user is invalid', async () => {
      jest.spyOn(model, 'create').mockResolvedValueOnce(null);

      const result = await service.signIn(signInDto);
      expect(result).rejects.toThrow(UnauthorizedException);
    });
    */
  });
});

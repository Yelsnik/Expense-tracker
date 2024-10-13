import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  const array = {
    some: jest.fn(),
  };

  const request = {
    getRequest: jest.fn().mockReturnValue({}),
  };

  const mockExecutionContext: Partial<ExecutionContext> = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user: { role: 'user' } }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  const mockExecutionContextNoUser: Partial<ExecutionContext> = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGuard, Reflector],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(new RoleGuard(reflector)).toBeDefined();
  });

  describe('role guard', () => {
    const roles = ['user'];
    it('it should return true if there are no roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const guardMock = guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      //console.log(guardMock);
      expect(guardMock).toBe(true);
    });

    it('it should return true if role matches', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user']);
      
      const guardMock = guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );
      console.log(guardMock);

      expect(guardMock).toBe(true);
    });

    it('it should return false if no role matches', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const guardMock = guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );
      console.log(guardMock);

      expect(guardMock).toBe(false);
    });
  });
});

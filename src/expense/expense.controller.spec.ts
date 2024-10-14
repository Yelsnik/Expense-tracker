import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { Model } from 'mongoose';
import { User } from 'src/auth/auth.schema';
import { ExpenseService } from './expense.service';
import { getModelToken } from '@nestjs/mongoose';
import { CanActivate } from '@nestjs/common';
import { AuthenticationGuard } from 'src/auth/authentication/authentication.guard';
import { RoleGuard } from 'src/auth/role/role.guard';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let expenseService: ExpenseService

  const mockUserModel = {}
  const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) }
  const mockExpenseService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: mockExpenseService
        }
      ]
    }).overrideGuard(AuthenticationGuard).useValue(mockAuthGuard).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    expenseService = module.get<ExpenseService>(ExpenseService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

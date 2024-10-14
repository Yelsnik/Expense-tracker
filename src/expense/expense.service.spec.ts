import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { Expense, ExpenseDocument } from './expense.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let model: Model<Expense>

  let mockExpenseModel = {
    create: jest.fn()
  }

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'kingsley',
    email: 'kingsleyokgeorge@gmail.com',
    password: 'helloooo',
    passwordConfirm: 'helloooo',
    role: 'user',
    active: true,
  };

  const request = {
    user: {_id: '61c0ccf11d7bf83d153d7c06'}
  }

  const mockExpense = {
    _id: '61c0ccf11d7bf83d153d7c05',
    title: 'car expense',
    amount: 1500,
    incurred: Date.now(),
    category: 'car',
    notes: 'car expense record',
    slug: 'car-expense',
    updated: Date.now(),
    created: Date.now(),
    user:  mockUser 
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getModelToken(Expense.name),
          useValue: mockExpenseModel
        }
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    model = module.get<Model<Expense>>(getModelToken(Expense.name));
    
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', ()=>{
    const data = {
      title: "Fifth Expense",
      amount: 1500,
      category: "book",
      notes: "book expenses",
    } as Expense

    it('it should create expense and return data', async ()=>{
      jest.spyOn(model, 'create').mockResolvedValue([mockExpense as unknown as ExpenseDocument])

      const mockService = await service.createExpense(data, request)

      console.log(mockService, mockExpense)
      expect(mockService[0]).toEqual(mockExpense)
    })
  })
});

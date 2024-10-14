import {
  //  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  //  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  //UseFilters,
  UseGuards,
  //Version,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { UpdateExpenseDto } from './dto/updateExpense.dto';
import { RoleGuard } from 'src/auth/role/role.guard';
import { AuthenticationGuard } from 'src/auth/authentication/authentication.guard';
import { Expense } from './expense.schema';
import { Role } from 'src/helpers/constants';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('expenses')
@UseGuards(AuthenticationGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(
    @Body() data: Expense,
    @Res() response: any,
    @Req() request: any,
  ) {
    const expense = await this.expenseService.createExpense(data, request);

    return response.status(201).json({
      message: 'success',
      data: expense,
    });
  }

  @Get('month')
  async getMonth(@Res() response: any, @Req() request) {
    const stats = await this.expenseService.getCurrentPreviewMonthly(request);
    //console.log(request.query);
    return response.status(200).json({
      message: 'success',
      data: stats,
    });
  }

  @Get('expense-by-category')
  async getExpenseByCategory(@Res() response: any, @Req() request: any) {
    const stats = await this.expenseService.getExpenseByCategory(request);
    //console.log(request.query);
    return response.status(200).json({
      message: 'success',
      data: stats,
    });
  }

  @UseGuards(RoleGuard)
  @Get()
  @Roles(Role.ADMIN)
  async getExpenses(@Res() response: any, @Req() request: any) {
    const expenses = await this.expenseService.getExpenses(request);
    //console.log(request.user._id);
    return response.status(200).json({
      message: 'success',
      data: expenses,
    });
  }

  @Get('expense-stats-day/:category')
  async getExpenseStatsDay(@Res() response: any, @Param() params: any) {
    const stats = await this.expenseService.getExpenseStatsDay(params.category);
    //console.log(request.query);
    return response.status(200).json({
      message: 'success',
      data: stats,
    });
  }

  @Get('expense-stats-month/:category')
  async getExpenseStatsMonth(@Res() response: any, @Param() params: any) {
    const stats = await this.expenseService.getExpenseStatsMonth(
      params.category,
    );
    //console.log(request.query);
    return response.status(200).json({
      message: 'success',
      data: stats,
    });
  }

  @UseGuards( RoleGuard)
  @Get(':id')
  // @UseFilters(new MongoExceptionFilter())
  async getOneExpense(@Param() params: any, @Res() response: any) {
    const expense = await this.expenseService.getOneExpense(params.id);

    return response.status(201).json({
      message: 'success',
      data: expense,
    });
  }

  @Patch(':id')
  @HttpCode(204)
  async updateExpense(
    @Param() params: any,
    @Body() body: UpdateExpenseDto,
    @Res() response: any,
  ) {
    const expense = await this.expenseService.updateExpenses(params.id, body);

    return response.status(200).json({
      message: 'success',
      data: expense,
    });
  }

  @Delete(':id')
  async deleteExpense(@Param() params: any, @Res() response: any) {
    await this.expenseService.deleteExpense(params.id);

    return response.status(200).json({
      message: 'success',
      data: null,
    });
  }
}

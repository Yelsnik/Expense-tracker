import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import mongoose, { Error, Model, Mongoose } from 'mongoose';
import { Expenses } from 'src/interfaces/interface';
import { ExpenseDto } from './dto/expense.dto';
import { MagicStrings } from 'src/helpers/constants';
import { ApiFeatures } from 'src/helpers/apiFeatures';
import { Expense } from './expense.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async createExpense(data: Expense, req: any): Promise<Expense> {
    try {
      data.user = req.user._id;
      return await this.expenseModel.create(data);
    } catch (err) {
      throw new Error(`${err.message}`);
    }
  }

  async getExpenses(request?: any): Promise<Expense[]> {
    const features = new ApiFeatures(
      this.expenseModel.find({ user: request.user._id }),
      request.query,
    )
      .filter()
      .sort()
      .limit()
      .pagination();
    //Execute the query
    const expenses = await features.query;

    //console.log(this.expenseModel.db);

    return expenses;
  }

  async getExpenseStatsDay(params: string) {
    const stats = await this.expenseModel.aggregate([
      {
        $match: {
          $or: [{ category: `${params}` }],
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$created' },
          numExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
          day: { $first: { $dayOfMonth: '$created' } },
        },
      },
      {
        $sort: { avgAmount: -1 },
      },
    ]);

    // {
    //  $dateToString: { format: '%Y-%m-%d', date: '$created' },
    // },
    return stats;
  }

  async getExpenseStatsMonth(params: string) {
    const stats = await this.expenseModel.aggregate([
      {
        $match: {
          $or: [{ category: `${params}` }],
        },
      },
      {
        $group: {
          _id: { $month: '$created' },
          numExpenses: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
          sum: { $sum: '$amount' },
          month: { $first: { $month: '$created' } },
        },
      },

      {
        $sort: { avgAmount: -1 },
      },
    ]);

    // {
    //  $dateToString: { format: '%Y-%m-%d', date: '$created' },
    // },
    return stats;
  }

  async getCurrentPreviewMonthly(req: any) {
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const currentPreview = await this.expenseModel.aggregate([
      {
        $facet: {
          month: [
            {
              $match: {
                incurred: { $gte: firstDay, $lt: lastDay },
                user: new mongoose.Types.ObjectId(req.user._id),
              },
            },
            {
              $group: { _id: 'currentMonth', totalSpent: { $sum: '$amount' } },
            },
          ],
          today: [
            {
              $match: {
                incurred: { $gte: today, $lt: tomorrow },
                user: new mongoose.Types.ObjectId(req.user._id),
              },
            },
            {
              $group: { _id: 'today', totalSpent: { $sum: '$amount' } },
            },
          ],
          yesterday: [
            {
              $match: {
                incurred: { $gte: yesterday, $lt: today },
                user: new mongoose.Types.ObjectId(req.user._id),
              },
            },
            {
              $group: { _id: 'yesterday', totalSpent: { $sum: '$amount' } },
            },
          ],
        },
      },
    ]);

    return currentPreview;
  }

  async getExpenseByCategory(req: any) {
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    const expenseByCategory = await this.expenseModel.aggregate([
      {
        $facet: {
          average: [
            {
              $match: { user: new mongoose.Types.ObjectId(req.user._id) },
            },
            {
              $group: {
                _id: { category: '$category', month: '$incurred' },
                totalSpent: { $sum: '$amount' },
              },
            },
            {
              $group: {
                _id: '$_id.category',
                avgSpent: { $avg: '$totalSpent' },
              },
            },
            {
              $project: {
                _id: '$_id',
                value: { average: '$avgSpent' },
              },
            },
          ],
          total: [
            {
              $match: {
                incurred: { $gte: firstDay, $lt: lastDay },
                user: new mongoose.Types.ObjectId(req.user._id),
              },
            },
            {
              $group: { _id: '$category', totalSpent: { $sum: '$amount' } },
            },
            {
              $project: {
                _id: '$_id',
                value: { total: '$totalSpent' },
              },
            },
          ],
        },
      },
      {
        $project: {
          overview: { $setUnion: ['$average', '$total'] },
        },
      },
      {
        $unwind: '$overview',
      },
      { $replaceRoot: { newRoot: '$overview' } },
      {
        $group: { _id: '$_id', mergedValues: { $mergeObjects: '$value' } },
      },
    ]);

    return expenseByCategory;
  }

  async getOneExpense(expenseId: string): Promise<Expense[]> {
    return await this.expenseModel.findById(expenseId);
  }

  async updateExpenses(expenseId: string, body: any) {
    const patch = await this.expenseModel
      .findByIdAndUpdate(expenseId, body)
      .setOptions({ overwrite: true, new: true });

    return patch;
  }

  async deleteExpense(expenseId: string) {
    return await this.expenseModel.findByIdAndDelete(expenseId);
  }
}

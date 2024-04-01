import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Error, Model } from 'mongoose';
import { Expenses } from 'src/interfaces/interface';
import { MagicStrings } from 'src/helpers/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Test } from './test.schema';

@Injectable()
export class TestService {
  constructor(@InjectModel(Test.name) private testModel: Model<Test>) {}

  async createTest(data: Test): Promise<Test> {
    try {
      return await this.testModel.create(data);
    } catch (err) {
      throw new Error(`${err.message}`);
    }
  }

  async getTest() {
    await this.testModel.find();
  }
}

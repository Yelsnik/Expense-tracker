import { Document } from 'mongoose';

export interface Expenses extends Document {
  readonly title: string;
  readonly amount: number;
  readonly category: string;
  readonly incurred?: Date;
  readonly notes: string;
}

export interface Users extends Document {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly passwordConfirm: string;
  readonly role?: string;
  readonly resetPasswordToken?: string;
  readonly resetPasswordExpire?: Date;
  readonly createdAt?: Date;
  readonly active?: boolean;
}

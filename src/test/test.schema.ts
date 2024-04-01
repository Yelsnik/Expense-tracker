import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/auth/auth.schema';
import { Types } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Test>;

@Schema()
export class Test {
  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;
}

export const TestSchema = SchemaFactory.createForClass(Test);

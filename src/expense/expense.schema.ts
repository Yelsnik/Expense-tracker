import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/auth/auth.schema';
import { Types } from 'mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema()
export class Expense {
  @Prop({
    trim: true,
    required: [true, 'Title is required'],
  })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({
    min: 0,
    required: [true, 'Amount is required'],
  })
  amount: number;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  incurred: Date;

  @Prop({ type: String, trim: true })
  notes: string;

  @Prop()
  slug: string;

  @Prop()
  updated: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  created: Date;
}

//console.log(Expense);

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

/*
import * as mongoose from 'mongoose';
import slugify from 'slugify';

const Schema = mongoose.Schema;

export const ExpenseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Title is required'],
  },
  amount: {
    type: Number,
   
  },
  category: {
   
  },
  incurred: {
   
  },
  notes: {
   
  },
  slug: String,
  // recordedBy: {
  //   type: ,
  //   ref: 'User',
  // },
  
});

// Query middleware
ExpenseSchema.pre(/^find/, function (next) {
  next();
});

*/

ExpenseSchema.pre('save', function (next) {
  this.user = new User();
  next();
});

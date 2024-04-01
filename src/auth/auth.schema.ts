import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Document,
  CallbackWithoutResultAndOptionalError,
} from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/helpers/constants';
import * as crypto from 'crypto';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    required: [true, 'Please add a name'],
  })
  name: string;

  @Prop({
    required: [true, 'Please add an email!'],
    unique: [true, 'Email already exists!'],
    lowercase: [true],
  })
  email: string;

  @Prop({
    required: [true, 'Please add a password'],
    // select: false,
  })
  password: string;

  @Prop({
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on save and create
      validator: function (el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
    select: false,
  })
  passwordConfirm: string;

  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    // select: false,
  })
  role: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpire: Date;

  @Prop({
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    default: true,
    select: false,
  })
  active: boolean;

  @Prop()
  passwordChangedAt: Date;

  @Prop()
  passwordResetToken: string;

  @Prop({
    type: Number,
  })
  passwordResetExpires: number;

  changedPasswordAfter(JWTTimestamp: number) {
    if (this.passwordChangedAt) {
      const time = this.passwordChangedAt.getTime() / 1000;
      const timeString = time.toString();
      const changedTimestamp = parseInt(timeString, 10);
      console.log(this.passwordChangedAt, timeString, JWTTimestamp);
      return JWTTimestamp < changedTimestamp;
    }

    // not changed
    return false;
  }

  async correctPassword(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  }

  static async findMiddleware(
    this: any,
    conditions: Record<string, any>,
    next: CallbackWithoutResultAndOptionalError,
  ) {
    // Modify 'conditions' or perform additional logic before the find operation
    // For example, you can add additional criteria to the 'conditions' object
    conditions.active = true;

    // Call the next function to continue with the find operation
    next();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

UserSchema.pre('save', async function (next) {
  // run if password was modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { MagicStrings } from 'src/helpers/constants';
import { Users } from 'src/interfaces/interface';
import { UserDto } from 'src/auth/user.dto';
import {
  bodyUpdatePasswordDto,
  forgotPasswordDto,
  loginDto,
  resetPasswordDto,
} from './dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionFilter } from 'src/helpers/http-exception.filter';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.schema';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  signToken(user: any) {
    return this.jwtService.sign({ id: user._id });
  }

  filterObj(obj: any, ...allowedFields: any) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }

  async signUp(data: UserDto) {
    const { name, email, password, passwordConfirm, role } = data;

    const user = await this.userModel.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
    });

    const token = this.signToken(user);

    return { token, user };
  }

  async signIn(data: loginDto): Promise<{ token: string; user: User }> {
    const { email, password } = data;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const token = this.signToken(user);

    user.password = undefined;

    return { token, user };
  }

  async forgotPassword(data: forgotPasswordDto, req: any) {
    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      throw new UnauthorizedException(`There is no user with that email`);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    console.log(resetToken);

    // send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/auth/resetpassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    await this.mailService.sendMail({
      from: 'Kingsley Okure <kingsleyokgeorge@gmail.com>',
      to: user.email,
      subject: `Your password reset token valid for 10 minutes`,
      text: message,
    });
  }

  async resetPassword(data: resetPasswordDto, token: string): Promise<string> {
    // get user based on token

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    // console.log(token);

    console.log(hashedToken);

    const user = await this.userModel.findOne({
      passwordResetExpires: { $gt: Date.now() },
      passwordResetToken: hashedToken,
    });

    if (!user || user === null) {
      throw new BadRequestException(`Invalid token or expired token`);
    }

    console.log('user', user);
    // set new password if token has not expired and there is a user

    user.password = data.password;
    user.passwordConfirm = data.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // update the changed password at property for the current user

    const newToken = this.signToken(user._id);

    return newToken;
  }

  async updatePassword(userObj: any, body: bodyUpdatePasswordDto) {
    // get user

    const user = await this.userModel.findById(userObj.id).select('+password');

    // check if posted password is correct

    if (!(await user.correctPassword(body.passwordCurrent))) {
      throw new UnauthorizedException(`Your current password is wrong`);
    }

    // if so update password
    user.password = body.password;
    user.passwordConfirm = body.passwordConfirm;
    await user.save();

    const newToken = this.signToken(user._id);

    return newToken;
  }

  async updateMe(body: any, userObj: any) {
    // check if user posts password instead
    if (body.password || body.passwordConfirm) {
      throw new BadRequestException(`This route is not for password update`);
    }

    // filter out unwanted field names
    const filtered = this.filterObj(body, 'name', 'email');

    // update user document
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userObj.id,
      filtered,
      {
        new: true,
        runValidators: true,
      },
    );

    return updatedUser;
  }

  async deleteMe(request: any) {
    await this.userModel.findByIdAndUpdate(request.user.id, {
      active: false,
    });
  }

  async getUsers() {
    return await this.userModel.find({ active: true }).exec();
  }
}

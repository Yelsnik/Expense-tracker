import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDto } from 'src/auth/dto/user.dto';
import {
  bodyUpdatePasswordDto,
  forgotPasswordDto,
  loginDto,
  resetPasswordDto,
  updateUserDto,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.schema';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  // function for hashing refresh token
  async hashResetToken(token: string) {
    return await argon2.hash(token);
  }

  // function to get tokens
  async getTokens(userId: any, email: string) {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string | number>('JWT_EXPIRES_IN'),
        },
      ),
    ]);

    return accessToken;
  }

  // function to filter object
  filterObj(obj: any, ...allowedFields: any) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }

  // sign up function
  async signUp(data: UserDto) {
    const { name, email, password, passwordConfirm, role } = data;

    try {
      const user = await this.userModel.create({
        name,
        email,
        password,
        passwordConfirm,
        role,
      });

      const tokens = await this.getTokens(user._id, user.email);
      return { tokens, user };
    } catch (err) {
      if (err?.code === 11000) {
        throw new ConflictException('Duplicate email entered');
      }
    }
  }

  // sign in function
  async signIn(data: loginDto) {
    const { email, password } = data;

    let user = await this.userModel.findOne({ email }); //.select('+password');

    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    console.log(password, user.password, user);

    const tokens = await this.getTokens(user._id, user.email);
    user.password = undefined;
    return { tokens, user };
  }

  // forgot password function
  async forgotPassword(data: forgotPasswordDto, req: any) {
    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      throw new UnauthorizedException(`There is no user with that email`);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    console.log(resetToken);

    // -- send it to user's email
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

  // reset password function
  async resetPassword(data: resetPasswordDto, token: string): Promise<any> {
    // -- get user based on token

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log(hashedToken);

    const user = await this.userModel.findOne({
      passwordResetExpires: { $gt: Date.now() },
      passwordResetToken: hashedToken,
    });

    if (!user || user === null) {
      throw new BadRequestException(`Invalid token or expired token`);
    }

    console.log('user', user);

    // -- set new password if token has not expired and there is a user
    user.password = data.password;
    user.passwordConfirm = data.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // -- update the changed password at property for the current user
    const newTokens = await this.getTokens(user._id, user.email);
    return newTokens;
  }

  // update password function
  async updatePassword(userObj: any, body: bodyUpdatePasswordDto) {
    // -- get user
    const user = await this.userModel.findById(userObj.id).select('+password');

    // -- check if posted password is correct
    if (!(await user.correctPassword(body.passwordCurrent))) {
      throw new UnauthorizedException(`Your current password is wrong`);
    }

    // -- if so update password
    user.password = body.password;
    user.passwordConfirm = body.passwordConfirm;
    await user.save();

    const newTokens = await this.getTokens(user._id, user.email);
    return newTokens;
  }

  // funtion to update a person's profile
  async updateMe(body: any, userObj: any) {
    // -- check if user posts password instead
    if (body.password || body.passwordConfirm) {
      throw new BadRequestException(`This route is not for password update`);
    }

    // -- filter out unwanted field names
    const filtered = this.filterObj(body, 'name', 'email');

    // -- update user document
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

  // funtion to delete a person's profile
  async deleteMe(request: any) {
    await this.userModel.findByIdAndUpdate(request.user.id, {
      active: false,
    });
  }

  // function to get all users
  async getUsers() {
    return await this.userModel.find({ active: true }).exec();
  }

  // funtion to update users
  async updateUser(id: string, updateUserDto: updateUserDto) {
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
      })
      .exec();
  }
}

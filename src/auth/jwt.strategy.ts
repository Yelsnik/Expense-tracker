import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from './auth.schema';
import { Model } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
   
    // Get the user id from the payload
    const { id } = payload;

    // find and check if the user exists
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new UnauthorizedException(
        `You are not logged in! Please login to access this route`,
      );
    }

    // check if user changed password after token was issued
    if (user.changedPasswordAfter(payload.iat)) {
      throw new UnauthorizedException(
        `User recently changed password. Please log in again!`,
      );
    }

    return user;
   
  }
}

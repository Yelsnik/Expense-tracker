import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { User } from '../auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();

      const token = request.headers.authorization.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Please login!');
      }

      // verify the token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // check if the user exists
      const user = await this.userModel.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      // check if user changed password after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        throw new UnauthorizedException(
          `User recently changed password. Please log in again!`,
        );
      }

      request.user = user;

      

      // console.log('1', request.user);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    return true;
  }
}

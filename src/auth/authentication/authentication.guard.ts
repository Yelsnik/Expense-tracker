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

export interface decodedObj {
    sub: string
    email: string
    iat: number
    exp: number
 
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      let token = ''

      if ( request.headers.authorization &&
        request.headers.authorization.startsWith("Bearer")){
           token = request.headers.authorization.split(' ')[1];
        } else {
          throw new UnauthorizedException('Please login!')
        }
      
      if (!token) {
        throw new UnauthorizedException('Please login!');
      }

      // verify the token
      const decoded: decodedObj = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      
      // check if the user exists
      const user = await this.userModel.findById(decoded.sub);

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
  
    return true;
  }
}

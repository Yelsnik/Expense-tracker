import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/auth/dto/user.dto';
import {
  bodyUpdatePasswordDto,
  forgotPasswordDto,
  loginDto,
} from './dto/auth.dto';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() data: UserDto, @Res() response: any) {
    const user = await this.authService.signUp(data);
    /*
   .cookie('jwt', user.token, {
        // expires: 300,
        secure: true,
      })
    */
    return response.status(201).json({
      message: 'success',
      data: user,
    });
  }

  @Post('sign-in')
  @UseGuards(ThrottlerGuard)
  async signIn(@Body() data: loginDto, @Res() response: any) {
    const user = await this.authService.signIn(data);

    const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    console.log(expires);

    return response
      .cookie('jwt', user.tokens, { expires: expires, httpOnly: true })
      .status(201)
      .json({
        message: 'success',
        data: user,
      });
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() data: forgotPasswordDto,
    @Res() response: any,
    @Req() request,
  ) {
    try {
      await this.authService.forgotPassword(data, request);

      return response.json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Patch('reset-password/:token')
  async resetPassword(
    @Param() param: any,
    @Res() response: any,
    @Body() data: any,
  ) {
    try {
      const token = await this.authService.resetPassword(data, param.token);

      return response.json({
        message: 'success',
        data: token,
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(AuthenticationGuard)
  @Patch('update-password')
  async updatePassword(
    @Res() response: any,
    @Req() request: any,
    @Body() data: bodyUpdatePasswordDto,
  ) {
    try {
      const token = await this.authService.updatePassword(request.user, data);

      return response.json({
        message: 'success',
        data: token,
      });
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  @UseGuards(AuthenticationGuard)
  @Patch('update-me')
  async updateMe(@Res() response: any, @Req() request: any, @Body() data: any) {
    const updatedUser = await this.authService.updateMe(data, request.user);

    return response.json({
      message: 'success',
      data: updatedUser,
    });
  }

  @UseGuards(AuthenticationGuard)
  @Delete('delete-me')
  async deleteMe(@Res() response: any, @Req() request: any, @Body() data: any) {
    await this.authService.deleteMe(request);

    return response.status(204).json({
      message: 'success',
      data: null,
    });
  }

  @Get('users')
  async getUsers(@Res() response: any) {
    const users = await this.authService.getUsers();

    return response.status(200).json({
      message: 'success',
      data: users,
    });
  }
}

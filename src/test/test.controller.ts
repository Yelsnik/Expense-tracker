import {
  //  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  //  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  //UseFilters,
  UseGuards,
  //Version,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/helpers/constants';
import { RoleGuard } from 'src/auth/role/role.guard';
import { AuthenticationGuard } from 'src/auth/authentication/authentication.guard';
import { TestService } from './test.service';
import { Test } from './test.schema';

@Controller('test')
@UseGuards(AuthenticationGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async createTest(@Body() data: Test, @Res() response: any) {
    const test = await this.testService.createTest(data);

    return response.status(201).json({
      message: 'success',
      data: test,
    });
  }
}

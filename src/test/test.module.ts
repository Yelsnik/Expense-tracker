import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestSchema } from './test.schema';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/auth.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
    ConfigModule,
    JwtModule.register({
      // global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    AuthModule,
  ],
  providers: [TestService],
  controllers: [TestController],
})
export class TestModule {}

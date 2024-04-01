import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  isLowercase,
  minLength,
} from 'class-validator';

export class loginDto {
  @IsEmail()
  email: string;

  // @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  password: string;
}

export class forgotPasswordDto {
  @IsEmail()
  email: string;
}

export class resetPasswordDto {
  password: string;
  passwordConfirm: string;
}

export class bodyUpdatePasswordDto {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

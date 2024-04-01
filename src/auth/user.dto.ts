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
  minLength,
} from 'class-validator';
import { Role } from 'src/helpers/constants';

export class UserDto {
  @IsString({ message: 'Please enter a valid name' })
  name: string;

  @IsEmail({}, { message: 'Please enter a correct email' })
  email: string;

  // @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  password: string;

  // @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  passwordConfirm: string;

  @IsOptional()
  @IsString({ message: 'Please enter a valid role' })
  role?: Role;
}

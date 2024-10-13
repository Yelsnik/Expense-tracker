import { IsDate, IsEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/auth/auth.schema';

export class ExpenseDto {
  @IsString()
  private readonly title: string;

  @IsNumber()
  private readonly amount: number;

  @IsString()
  private readonly category: string;

  private readonly incurred?: Date;

  @IsString()
  private readonly notes?: string;

  private readonly user?: User;
}

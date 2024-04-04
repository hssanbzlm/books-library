import { IsEnum, IsNumber } from 'class-validator';
import { status, statusState } from '../entities/userToBook';

export class UpdateBorrowBookDto {
  @IsNumber()
  borrowId: number;

  @IsEnum(status)
  status: statusState;
}

import { IsNumber, IsString } from 'class-validator';
import { statusState } from '../entities/userToBook';

export class UpdateBorrowBookDto {
  @IsNumber()
  borrowId: number;

  @IsString()
  status: statusState;
}

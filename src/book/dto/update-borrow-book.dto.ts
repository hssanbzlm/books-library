import { IsEnum, IsInt} from 'class-validator';
import { status, statusState } from '../entities/userToBook';
import { Type } from 'class-transformer';

export class UpdateBorrowBookDto {
  
  @Type(()=>Number)
  @IsInt()
  borrowId: number;

  @IsEnum(status)
  status: statusState;
}

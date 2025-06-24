import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class UpdateUserBorrowDto {
  @Type(()=>Number)
  @IsInt()
  borrowId: number;
  @Type(() => Date)
  @IsDate()
  startDate: Date;
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

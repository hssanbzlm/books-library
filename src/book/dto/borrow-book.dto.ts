import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class BorrowBookDto {
  @Type(()=>Number)
  @IsInt()
  idBook: number;
  @Type(() => Date)
  @IsDate()
  startDate: Date;
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

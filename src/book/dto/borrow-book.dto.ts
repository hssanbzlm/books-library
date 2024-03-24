import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class BorrowBookDto {
  @IsNumber()
  idBook: number;
  @Type(() => Date)
  @IsDate()
  startDate: Date;
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

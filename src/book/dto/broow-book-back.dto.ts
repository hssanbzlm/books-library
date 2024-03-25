import { IsNumber } from 'class-validator';

export class BorrowBookBackDto {
  @IsNumber()
  idBook: number;
}

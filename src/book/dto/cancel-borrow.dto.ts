import { IsNumber } from 'class-validator';

export class CancelBorrowDto {
  @IsNumber()
  borrowId: number;
}

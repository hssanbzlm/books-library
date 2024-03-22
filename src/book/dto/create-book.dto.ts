import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;
  @IsNumber()
  numberOfPages: number;
  @IsString()
  edition: string;
  @Type(() => Date)
  @IsDate()
  date: Date;
  @IsArray()
  authorIds: number[];
}

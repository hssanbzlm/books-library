import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @Min(50)
  @IsNumber()
  numberOfPages: number;
  @IsNotEmpty()
  @IsString()
  edition: string;
  @Type(() => Date)
  @IsDate()
  date: Date;
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  authorIds: number[];
}

import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @Type(() => Number)
  @Min(50)
  @IsNumber()
  numberOfPages: number;
  @IsNotEmpty()
  @IsString()
  edition: string;
  @Type(() => Date)
  @IsDate()
  date: Date;
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
  coverPath: string;
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  authors: string[];
}

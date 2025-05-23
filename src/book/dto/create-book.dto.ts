import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { BookCategory, Category } from '../entities/book.entity';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @Type(() => Number)
  @IsNumber()
  numberOfPages: number;
  @IsNotEmpty()
  @IsString()
  edition: string;
  @IsString()
  synopsis: string;
  @Type(() => Number)
  @IsNumber()
  year: number;
  @IsEnum(Category)
  category: BookCategory;
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
  coverPath: string;
  @Type(() => String)
  @IsString({ each: true })
  @ArrayMinSize(1)
  authors: string[];
}

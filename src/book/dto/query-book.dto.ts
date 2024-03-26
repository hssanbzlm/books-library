import { IsNumber, IsString, IsOptional } from 'class-validator';

export class QueryBookDto {
  @IsString()
  title: string;

  @IsString()
  edition: string;
}

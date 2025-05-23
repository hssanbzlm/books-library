import { IsNotEmpty, IsString } from 'class-validator';

export class RecommendBookDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

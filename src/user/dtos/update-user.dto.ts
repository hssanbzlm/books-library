import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dtos/create-user.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  password: string;
}

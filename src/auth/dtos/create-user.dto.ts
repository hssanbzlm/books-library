import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsString()
  lastName: string;
  @IsEmail()
  email: string;
}

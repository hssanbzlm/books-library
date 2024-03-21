import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsString()
  lastName: string;
  @IsString()
  password: string;
  @IsEmail()
  email: string;
}

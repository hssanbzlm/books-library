import { IsEnum, IsNumber } from 'class-validator';
import { status, statusState } from '../entities/userToBook';
import { Type } from 'class-transformer';

export class UpdateNotifSeenDto {
  @IsNumber({}, { each: true })
  notifications: number[];
}

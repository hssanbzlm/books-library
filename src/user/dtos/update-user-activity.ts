import { IsBoolean } from 'class-validator';

export class UpdateUserActivity {
  @IsBoolean()
  active: boolean;
}

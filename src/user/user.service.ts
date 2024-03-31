import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserActivity } from './dtos/update-user-activity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll() {
    const user = await this.userRepo.find();
    return instanceToPlain(user);
  }

  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.update({ id }, updateUserDto);
    return instanceToPlain(user);
  }

  async updateActivity(id: number, updateUserActivity: UpdateUserActivity) {
    const user = await this.userRepo.update(
      { id },
      { active: updateUserActivity.active },
    );
    return instanceToPlain(user);
  }
}

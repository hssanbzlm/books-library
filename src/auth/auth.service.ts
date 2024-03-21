import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async signup({ email, name, lastName, password }: CreateUserDto) {
    const [existingUser] = await this.repo.findBy({ email });
    if (existingUser)
      throw new BadRequestException('You are already signed up');
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const resultPassword = salt + '.' + hash.toString('hex');
    const createdUser = this.repo.create({
      email,
      name,
      lastName,
      password: resultPassword,
    });
    return this.repo.save(createdUser);
  }
  signin() {}
}

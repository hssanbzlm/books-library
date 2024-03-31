import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async signup({ email, name, lastName }: CreateUserDto) {
    const [existingUser] = await this.repo.findBy({ email });
    if (existingUser)
      throw new BadRequestException('You are already signed up');
    const salt = randomBytes(8).toString('hex');
    const password = this.passwordGenerator();
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const resultPassword = salt + '.' + hash.toString('hex');
    const createdUser = this.repo.create({
      email,
      name,
      lastName,
      password: resultPassword,
    });
    const savedUser = await this.repo.save(createdUser);
    this.mailerService.sendMail({
      to: email,
      from: this.configService.get<string>('EMAIL_REMINDER'),
      subject: 'Your account was created successfully',
      text: `You can access our platform with this password ${password}`,
    });

    return savedUser;
  }
  async signin(email: string, password: string) {
    const [user] = await this.repo.findBy({ email });
    if (!user) throw new BadRequestException('Does not exist');

    const [salt, storedPassword] = user.password.split('.');
    const plainToHash = (await scrypt(password, salt, 32)) as Buffer;

    if (plainToHash.toString('hex') === storedPassword) return user;
    throw new BadRequestException('Please, verify your credentials');
  }

  userList() {
    return this.repo.find({ relations: { userToBooks: true } });
  }
  private passwordGenerator(): string {
    let password = '';
    const str =
      'ABCDyz01EGH/*IJKhijklmnRSopLMNO789VWZ@#F%$abcdef456gXYqrstPQTUuvwx23';
    for (let i = 1; i <= 8; i++) {
      const char = Math.floor(Math.random() * str.length + 1);
      password += str.charAt(char);
    }
    return password;
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async use(req: any, res: any, next: () => void) {
    const userId = req.session.userId;
    if (userId) {
      const user = await this.userRepo.findOneBy({ id: userId });
      req.currentUser = user;
    }
    next();
  }
}

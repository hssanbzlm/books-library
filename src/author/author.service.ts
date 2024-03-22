import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { UpdateAuthorDto } from './dtos/update-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorService {
  constructor(@InjectRepository(Author) private repo: Repository<Author>) {}
  create(createAuthorDto: CreateAuthorDto) {
    const author = this.repo.create(createAuthorDto);
    return this.repo.save(author);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const author = await this.repo.findOneBy({ id });
    if (author) return author;
    throw new NotFoundException('Author not found');
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return this.repo
      .createQueryBuilder()
      .update(updateAuthorDto)
      .set(updateAuthorDto)
      .where('id= :id', { id })
      .execute();
  }

  remove(id: number) {
    return this.repo.delete({ id });
  }
}

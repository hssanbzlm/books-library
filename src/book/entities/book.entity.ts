import { Author } from 'src/author/entities/author.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserToBook } from './userToBook';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  numberOfPages: number;
  @Column()
  edition: string;
  @Column()
  date: Date;
  @ManyToMany(() => Author)
  @JoinTable()
  authors: Author[];

  @OneToMany(() => UserToBook, (userToBook) => userToBook.book)
  userToBooks: UserToBook[];
}

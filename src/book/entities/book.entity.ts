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
  @Column()
  quantity: number;
  @Column({ nullable: true })
  coverPath: string;
  @Column('text', { array: true })
  authors: string[];

  @OneToMany(() => UserToBook, (userToBook) => userToBook.book)
  userToBooks: UserToBook[];
}

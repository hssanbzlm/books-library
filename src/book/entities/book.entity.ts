import { Author } from 'src/author/entities/author.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}

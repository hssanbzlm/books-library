import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';
import { UserToBook } from './userToBook';

export class VectorTransformer implements ValueTransformer {
  to(data: number[] | null): string | null {
    if (!data) {
      return null;
    }
    return `[${data.join(',')}]`; 
  }

  from(value: string | null): number[] | null {
    if (!value) {
      return null;
    }
    const stringArray = value.substring(1, value.length - 1).split(',');
    return stringArray.map(str => parseFloat(str.trim()));
  }
}


export type BookCategory =
  | 'Horror'
  | 'Thriller'
  | 'Science fiction'
  | 'Fantasy'
  | 'Adventure'
  | 'Romance'
  | 'History'
  | 'Psychology'
  | 'Biography'
  | 'Sport'
  | 'Science'
  | 'N/A';
export enum Category {
  Horror = 'Horror',
  Thriller = 'Thriller',
  ScienceFiction = 'Science fiction',
  Fantasy = 'Fantasy',
  Adventure = 'Adventure',
  Romance = 'Romance',
  History = 'History',
  Psychology = 'Psychology',
  Biography = 'Biography',
  Sport = 'Sport',
  Science = 'Science',
  NA = 'N/A',
}
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
  @Column({ nullable: true })
  synopsis: string;
  @Column({ nullable: true })
  year: number;
  @Column({ default: 'N/A' })
  category: BookCategory;
  @Column()
  quantity: number;
  @Column({ nullable: true })
  coverPath: string;
  @Column('text', { array: true })
  authors: string[];
  @Column({type: 'varchar',transformer:new VectorTransformer(),nullable: true})
  embedding: number[];

  @OneToMany(() => UserToBook, (userToBook) => userToBook.book)
  userToBooks: UserToBook[];
}

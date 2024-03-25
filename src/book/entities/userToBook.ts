import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class UserToBook {
  @PrimaryGeneratedColumn()
  userToBookId: number;

  @Column()
  userId: number;

  @Column()
  bookId: number;

  @Column()
  startDate: Date;
  @Column()
  endDate: Date;

  @Column({ default: false })
  isBack: boolean;

  @ManyToOne(() => User, (user) => user.userToBooks)
  user: User;

  @ManyToOne(() => Book, (book) => book.userToBooks)
  book: Book;
}

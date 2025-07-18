import { User } from '../../common/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';
export type statusState =
  | 'Pending'
  | 'Checkedout'
  | 'Refused'
  | 'Accepted'
  | 'Damaged'
  | 'Lost'
  | 'Returned'
  | 'Overdue'
  | 'Canceled';
export enum status {
  Pending = 'Pending',
  CheckedOut = 'Checkedout',
  Refused = 'Refused',
  Accepted = 'Accepted',
  Damaged = 'Damaged',
  Lost = 'Lost',
  Returned = 'Returned',
  Overdue = 'Overdue',
  Canceled = 'Canceled',
}
@Entity()
export class UserToBook {
  @PrimaryGeneratedColumn()
  userToBookId: number;
  @CreateDateColumn()
  createdDate: Date;
  @Column()
  userId: number;
  @Column()
  bookId: number;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ default: 'Pending' })
  status: statusState;


  @ManyToOne(() => User, (user) => user.userToBooks,{onDelete:'CASCADE'})
  user: User;

  @ManyToOne(() => Book, (book) => book.userToBooks,{cascade:true})
  book: Book;
}

import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
export type statusState =
  | 'Pending'
  | 'Checked-out'
  | 'Refused'
  | 'Accepted'
  | 'Damaged'
  | 'Lost'
  | 'Returned'
  | 'Overdue';
export enum status {
  Pending = 'Pending',
  CheckedOut = 'Checked-out',
  Refused = 'Refused',
  Accepted = 'Accepted',
  Damaged = 'Damaged',
  Lost = 'Lost',
  Returned = 'Returned',
  Overdue = 'Overdue',
}
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

  @Column({ default: 'Pending' })
  status: statusState;

  @Column({ default: 'user' })
  receiverRole: string;

  @Column({ default: false })
  receiverSeen: boolean;

  @ManyToOne(() => User, (user) => user.userToBooks)
  user: User;

  @ManyToOne(() => Book, (book) => book.userToBooks)
  book: Book;
}

import { User } from '../../common/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  message: string;
  @CreateDateColumn()
  date: Date;
  @Column({default:false})
  receiverSeen: boolean;

  @ManyToOne(() => User, (user) => user.sentNotification,{onDelete:'CASCADE'})
  sender: User;
  @ManyToOne(() => User, (user) => user.receivedNotifications,{onDelete:'CASCADE'})
  receiver: User;
}

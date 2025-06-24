import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserToBook } from 'src/book/entities/userToBook';
import { Notification } from 'src/notifications/entities/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  lastName: string;
  @Column()
  email: string;
  @Exclude()
  @Column()
  password: string;
  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  admin: boolean;

  @OneToMany(() => UserToBook, (userToBook) => userToBook.user,{cascade:true})
  userToBooks: UserToBook[];

  @OneToMany(()=>Notification,(notif)=>notif.sender,{cascade:true})
  sentNotification:Notification[]

  @OneToMany(()=>Notification,(notif)=>notif.receiver,{cascade:true})
  receivedNotifications:Notification[]
}

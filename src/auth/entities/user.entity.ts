import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserToBook } from 'src/book/entities/userToBook';

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
  admin: boolean;

  @OneToMany(() => UserToBook, (userToBook) => userToBook.user)
  userToBooks: UserToBook[];
}

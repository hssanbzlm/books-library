import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
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
  @Transform(
    ({ value }) => {
      if (value) return 'Active';
      return 'Inactive';
    },
    { toPlainOnly: true },
  )
  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  admin: boolean;

  @OneToMany(() => UserToBook, (userToBook) => userToBook.user)
  userToBooks: UserToBook[];
}

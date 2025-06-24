import { Controller } from '@nestjs/common';

import { UserToBookService } from './user-to-book.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user-to-book')
export class UserToBookController {
  constructor(private userToBookService: UserToBookService) {}

  @MessagePattern({ cmd: 'borrow.list' })
  getAllList({ userId }) {
    if (userId) return this.userToBookService.getBorrowList({ userId });
    return this.userToBookService.getBorrowList();
  }

  @MessagePattern({ cmd: 'borrow' })
  borrowBook({ borrowDetails, user }) {
    return this.userToBookService.borrow(borrowDetails, user);
  }

  @MessagePattern({ cmd: 'borrow.update' })
  updateBorrowStatus({ borrowUpdate, user }) {
    return this.userToBookService.updateBorrowStatus(
      {
        borrowId: borrowUpdate.borrowId,
        status: borrowUpdate.status,
      },
      user,
    );
  }

  @MessagePattern({ cmd: 'borrow.isReadyToBorrow' })
  isBookReadyToBorrow({ bookId, user }) {
    return this.userToBookService.isReadyToBorrow(user.id, bookId);
  }

  @MessagePattern({ cmd: 'borrow.updateUserBorrow' })
  updateUserBorrow({ borrowUpdate }) {
    return this.userToBookService.updateUserBorrow(borrowUpdate);
  }
  @MessagePattern({ cmd: 'borrow.cancelUserBorrow' })
  cancelUserBorrow({ borrowId }) {
    return this.userToBookService.CancelUserBorrow({ borrowId });
  }
}

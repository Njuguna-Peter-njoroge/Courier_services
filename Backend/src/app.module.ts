import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './user/users/users.controller';
import { UsersController } from './service/users/users.controller';
import { UsersService } from './user/users/users.service';
import { OrdersService } from './order/orders/orders.service';
import { OrdersController } from './order/orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { MailerService } from '../shared/mailer/mailer/mailer.service';
import { MailerModule } from './mailer/mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [AppController, UsersController, OrdersController],
  providers: [AppService, UsersService, OrdersService, MailerService],
})
export class AppModule {}

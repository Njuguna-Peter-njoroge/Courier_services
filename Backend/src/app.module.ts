import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import {CustomMailerService} from "../shared/mailer/mailer/mailer.service";
import { MailerModule } from '../shared/mailer/mailer/mailermodule';
import {UsersModule} from "./users/user.module";
import {JwtModule} from "@nestjs/jwt";
import{CustomJwtModule} from "./auth/custom-jwt/custom-jwt.module";
import { OrderGateway } from './order/order.gateway';

@Module({
  imports: [MailerModule, AuthModule,CustomJwtModule,ConfigModule.forRoot()],
  controllers: [AppController, UsersController, OrdersController],
  providers: [AppService, UsersService, OrdersService,CustomMailerService, OrderGateway],
})
export class AppModule {}

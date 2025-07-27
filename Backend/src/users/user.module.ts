
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {PrismaModule} from "../prisma/prismamodule";

@Module({
    imports: [PrismaModule],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

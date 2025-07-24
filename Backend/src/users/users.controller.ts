import {Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "../Dtos/createUser.dto";
import {UserFiltersDto} from "../Dtos/useefilter.dto";
import {ChangePasswordDto} from "../Dtos/changepassword.dto";
import {AccountStatus} from "@prisma/client";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
    @Get()
    findAll(@Query() filters: UserFiltersDto) {
        if (
            filters.status ||
            filters.role ||
            filters.isVerified ||
            filters.search
        ) {
            return this.usersService.findWithFilters(filters);
        }
        return this.usersService.findAll();
    }
    @Get('paginated')
    findWithPagination(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        return this.usersService.findWithPagination(pageNum, limitNum);
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
    @Patch(':id/password')
    changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
        return this.usersService.changePassword(
            id,
            dto.currentPassword,
            dto.newPassword,
        );
    }
    @Patch(':id/status/active')
    reactivate(@Param('id') id: string) {
        return this.usersService.setStatus(id, AccountStatus.ACTIVE);
    }
}

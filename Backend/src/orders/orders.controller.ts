import {
    Body,
    Controller,
    Delete,
    Get, InternalServerErrorException, NotFoundException,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../Dtos/create order.dto';
import { Roles, User } from '../auth/decorators/roles.decorators';
import { UpdateOrderDto } from '../Dtos/update-order.dto';
import { UpdateOrderStatusDto } from '../Dtos/updateorder.dto';
import { FilterOrdersDto } from '../Dtos/filterOrder.dto';
import { JwtAuthGuard } from '../auth/Guards/auth.guards';
import { RolesGuard } from '../auth/Guards/role.guards';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // ✅ Create a new order
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    createOrder(@Body() dto: CreateOrderDto, @User() user: { id: string }) {
        return this.ordersService.createOrder(dto, user.id);
    }

    // ✅ Get all orders (ADMIN)
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAllOrders() {
        return this.ordersService.findAllOrders();
    }

    // ✅ Get orders for the current logged-in user (ADMIN)
    @Get('my-orders')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('USER','ADMIN')
    getOrdersByCustomer(@User() user: { id: string }) {
        return this.ordersService.getOrdersByCustomer(user.id);
    }

    // ✅ Get a single order by its ID
    @Get(':orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findOneOrder(@Param('orderId') orderId: string) {
        return this.ordersService.findOneOrder(orderId);
    }

    // ✅ Get status history of an order
    @Get('status-history/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('USER', 'ADMIN')
    getOrderStatusHistory(@Param('orderId') orderId: string) {
        return this.ordersService.getOrderStatusHistory(orderId);
    }

    // ✅ Update full order (by ADMIN)
    @Patch(':orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    updateOrder(
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderDto,
    ) {
        return this.ordersService.updateOrder(orderId, dto);
    }

    // async updateOrder(orderId: string, dto: UpdateOrderDto) {
    //     console.log('Updating order:', orderId);
    //     console.log('Update payload:', dto);
    //
    //     const order = await this.prisma.order.findUnique({
    //         where: { id: orderId },
    //     });
    //
    //     if (!order) {
    //         throw new NotFoundException('Order does not exist');
    //     }
    //
    //     try {
    //         return await this.prisma.order.update({
    //             where: { id: orderId },
    //             data: {
    //                 ...dto, // make sure this aligns with your model fields
    //             },
    //         });
    //     } catch (err) {
    //         console.error('Error updating order:', err);
    //         throw new InternalServerErrorException('Failed to update order');
    //     }
    // }


    // ✅ Update only order status (ADMIN or COURIER)
    @Patch(':orderId/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'COURIER')
    updateOrderStatus(
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderStatusDto,
        @User() user: { id: string },
    ) {
        return this.ordersService.updateOrderStatus(orderId, dto, user.id);
    }

    // ✅ Delete order (by ADMIN)
    @Delete(':orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    deleteOrder(@Param('orderId') orderId: string) {
        return this.ordersService.deleteOrder(orderId);
    }

    // ✅ Assign courier to an order
    @Patch('assign-courier/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    assignCourier(
        @Param('orderId') orderId: string,
        @Body('courierId') courierId: string,
    ) {
        return this.ordersService.assignCourier(orderId, courierId);
    }

    // ✅ Filter orders by status and date
    @Post('filter')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    filterOrders(@Body() dto: FilterOrdersDto) {
        const fromDate = dto.fromDate ? new Date(dto.fromDate) : undefined;
        const toDate = dto.toDate ? new Date(dto.toDate) : undefined;
        return this.ordersService.filterOrders(dto.status, fromDate, toDate);
    }
}

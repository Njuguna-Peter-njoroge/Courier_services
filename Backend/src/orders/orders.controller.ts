import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../Dtos/create order.dto';
import { UpdateOrderDto } from '../Dtos/update-order.dto';
import { UpdateOrderStatusDto } from '../Dtos/updateorder.dto';
import { FilterOrdersDto } from '../Dtos/filterOrder.dto';
import { JwtAuthGuard } from '../auth/Guards/auth.guards';
import { RolesGuard } from '../auth/Guards/role.guards';
import { Roles, User } from '../auth/decorators/roles.decorators';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createOrder(@Body() dto: CreateOrderDto, @User() user: { id: string }) {
    return this.ordersService.createOrder(dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  getOrdersByCustomer(@User() user: { id: string }) {
    return this.ordersService.getOrdersByCustomer(user.id);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOneOrder(@Param('orderId') orderId: string) {
    return this.ordersService.findOneOrder(orderId);
  }

  @Get('status-history/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  getOrderStatusHistory(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderStatusHistory(orderId);
  }

  @Patch(':orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateOrder(@Param('orderId') orderId: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.updateOrder(orderId, dto);
  }

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

  @Delete(':orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteOrder(@Param('orderId') orderId: string) {
    return this.ordersService.deleteOrder(orderId);
  }

  @Patch('assign-courier/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  assignCourier(
    @Param('orderId') orderId: string,
    @Body('courierId') courierId: string,
  ) {
    return this.ordersService.assignCourier(orderId, courierId);
  }

  @Post('filter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  filterOrders(@Body() dto: FilterOrdersDto) {
    const fromDate = dto.fromDate ? new Date(dto.fromDate) : undefined;
    const toDate = dto.toDate ? new Date(dto.toDate) : undefined;
    return this.ordersService.filterOrders(dto.status, fromDate, toDate);
  }
}

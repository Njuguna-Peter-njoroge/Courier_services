import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prismaservice';
import { CreateOrderDto } from '../Dtos/create order.dto';
import { UpdateOrderDto } from '../Dtos/update-order.dto';
import { UpdateOrderStatusDto } from '../Dtos/updateorder.dto';
import { OrderStatus } from '@prisma/client';
import { OrderGateway } from 'src/order/order.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGateway: OrderGateway,
  ) {}

  async createOrder(dto: CreateOrderDto, adminId: string) {
    // Verify admin
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new BadRequestException('Only admins can create orders');
    }

    // Verify customer exists, is active, and has USER role
    const customer = await this.prisma.user.findFirst({
      where: {
        id: dto.customerId,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    if (!customer) {
      throw new BadRequestException('Customer does not exist or is not active');
    }

    const order = await this.prisma.order.create({
      data: {
        orderId: `ORD-${Date.now()}`,
        pickupAddress: dto.pickupAddress,
        deliveryAddress: dto.deliveryAddress,
        courierService: dto.courierService,
        packageWeight: dto.packageWeight,
        packageDimensions: dto.packageDimensions,
        price: dto.price,
        notes: dto.notes,
        status: OrderStatus.PENDING,
        customer: {
          connect: {
            id: dto.customerId,
          },
        },
      },
    });

    this.orderGateway.sendOrderUpdate(order.id, {
      type: 'created',
      order,
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: { customer: true, assignedCourier: true },
    });
  }

  async getOrdersByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { statusHistory: true },
    });
  }

  async findOneOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, assignedCourier: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrderStatusHistory(orderId: string) {
    const history = await this.prisma.statusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    if (!history.length) {
      throw new NotFoundException('No status history for this order');
    }

    return history;
  }

  async updateOrder(orderId: string, dto: UpdateOrderDto) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        pickupAddress: dto.pickupAddress ?? existingOrder.pickupAddress,
        deliveryAddress: dto.deliveryAddress ?? existingOrder.deliveryAddress,
        pickupLat: dto.pickupLat ?? existingOrder.pickupLat,
        pickupLng: dto.pickupLng ?? existingOrder.pickupLng,
        deliveryLat: dto.deliveryLat ?? existingOrder.deliveryLat,
        deliveryLng: dto.deliveryLng ?? existingOrder.deliveryLng,
        courierLat: dto.courierLat ?? existingOrder.courierLat,
        courierLng: dto.courierLng ?? existingOrder.courierLng,
        courierService: dto.courierService ?? existingOrder.courierService,
        packageWeight: dto.packageWeight ?? existingOrder.packageWeight,
        packageDimensions:
          dto.packageDimensions ?? existingOrder.packageDimensions,
        price: dto.price ?? existingOrder.price,
        notes: dto.notes ?? existingOrder.notes,
        status: dto.status ?? existingOrder.status,
      },
    });

    if (dto.status && dto.status !== existingOrder.status) {
      await this.prisma.statusHistory.create({
        data: {
          orderId,
          status: dto.status,
          updatedBy: 'system',
          reason: dto.statusReason ?? 'Status updated',
          notes: dto.notes ?? '',
        },
      });
    }

    this.orderGateway.sendOrderUpdate(updatedOrder.id, {
      type: 'updated',
      order: updatedOrder,
    });

    return { message: 'Order updated successfully', order: updatedOrder };
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    updatedBy: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });

    await this.prisma.statusHistory.create({
      data: {
        orderId,
        status: dto.status,
        updatedBy,
        reason: dto.reason ?? 'Status changed',
        notes: dto.notes ?? '',
      },
    });

    this.orderGateway.sendOrderUpdate(orderId, {
      type: 'statusChanged',
      status: dto.status,
    });

    return {
      message: `Order status updated to ${dto.status}`,
      order: updatedOrder,
    };
  }

  async deleteOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.order.delete({ where: { id: orderId } });

    this.orderGateway.sendOrderUpdate(orderId, {
      type: 'deleted',
      orderId,
    });

    return { message: 'Order deleted successfully' };
  }

  async assignCourier(orderId: string, courierId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const courier = await this.prisma.user.findUnique({
      where: { id: courierId },
    });
    if (!courier || courier.role !== 'COURIER') {
      throw new BadRequestException('Invalid or unauthorized courier');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { assignedCourierId: courierId },
    });

    this.orderGateway.sendOrderUpdate(orderId, {
      type: 'courierAssigned',
      courierId,
    });

    return updatedOrder;
  }

  async filterOrders(status?: OrderStatus, fromDate?: Date, toDate?: Date) {
    return this.prisma.order.findMany({
      where: {
        status,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

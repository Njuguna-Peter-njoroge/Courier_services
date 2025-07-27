import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prismaservice";
import {CreateOrderDto} from "../Dtos/create order.dto";
import {OrderStatus} from "@prisma/client";
import {UpdateOrderDto} from "../Dtos/update-order.dto";
import {UpdateOrderStatusDto} from "../Dtos/updateorder.dto";

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {
    }

    async createOrder(dto: CreateOrderDto, adminId: string) {
        // verify if exisiting
        const admin = await this.prisma.user.findUnique({
            where: {id: adminId},
        });
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error('Only admins can create orders');
        }
        const customer = await this.prisma.user.findUnique({
            where: {id: dto.customerId},
        });
        if (!customer) {
            throw new Error('Customer does not exist');
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
                status: OrderStatus.PENDING, // ✅ use enum instead of string
                customer: {
                    connect: {id: dto.customerId},
                },
            },
        });
        return {
            message: 'Order created successfully',
            order: order,
        };
    }

    async findAllOrders() {
        const orders = await this.prisma.order.findMany({
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Flatten the customer name/email into the main object
        return orders.map(order => ({
            ...order,
            customerName: order.customer?.name ?? 'No Name',
            customerEmail: order.customer?.email ?? 'No Email',
        }));
    }

    async getOrdersByCustomer(customerId: string) {
        const orders = await this.prisma.order.findMany({
            where: {customerId},
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {createdAt: 'desc'},
        });

        return orders.map(order => ({
            ...order,
            customerName: order.customer?.name ?? 'No Name',
            customerEmail: order.customer?.email ?? 'No Email',
        }));
    }

    async getOrderStatusHistory(orderId: string) {
        return this.prisma.statusHistory.findMany({
            where: {orderId},
            orderBy: {createdAt: 'asc'},
        });
    }

    async findOneOrder(id: string) {
        const order = await this.prisma.order.findUnique({
            where: {id},
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            throw new Error('Order does not exist');
        }

        return {
            ...order,
            customerName: order.customer?.name ?? 'No Name',
            customerEmail: order.customer?.email ?? 'No Email',
        };
    }

    async updateOrder(id: string, dto: UpdateOrderDto) {
        const existingOrder = await this.prisma.order.findUnique({where: {id}});

        if (!existingOrder) {
            throw new NotFoundException('Order not found');
        }

        const updatedOrder = await this.prisma.order.update({
            where: {id},
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
                packageDimensions: dto.packageDimensions ?? existingOrder.packageDimensions,
                price: dto.price ?? existingOrder.price,
                notes: dto.notes ?? existingOrder.notes,
                status: dto.status ?? existingOrder.status,
            },
        });

        // Optional: log status change to history if status was updated
        if (dto.status && dto.status !== existingOrder.status) {
            await this.prisma.statusHistory.create({
                data: {
                    orderId: id,
                    status: dto.status,
                    updatedBy: 'system', // or inject user ID from request
                    reason: dto.statusReason ?? 'Status updated',
                    notes: dto.notes ?? '',
                },
            });
        }

        return {
            message: 'Order updated successfully',
            order: updatedOrder,
        };
    }

    async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, updatedBy: string) {
        const order = await this.prisma.order.findUnique({where: {id: orderId}});

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const updatedOrder = await this.prisma.order.update({
            where: {id: orderId},
            data: {
                status: dto.status,
            },
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

        return {
            message: `Order status updated to ${dto.status}`,
            order: updatedOrder,
        };
    }

    async deleteOrder(orderId: string) {
        const order = await this.prisma.order.findUnique({where: {id: orderId}});
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        await this.prisma.order.delete({where: {id: orderId}});

        return {message: 'Order deleted successfully'};
    }

    async assignCourier(orderId: string, courierId: string) {
        const order = await this.prisma.order.findUnique({
            where: {id: orderId},
        });
        if (!order) throw new NotFoundException('Order not found');

        const courier = await this.prisma.user.findUnique({
            where: {id: courierId},
        });
        if (!courier || courier.role !== 'COURIER') {
            throw new BadRequestException('Invalid or unauthorized courier');
        }

        // 3. Update the order with the assigned courier
        return this.prisma.order.update({
            where: {id: orderId},
            data: {assignedCourierId: courierId},
        });
    }

    async filterOrders(status?: OrderStatus, fromDate?: Date, toDate?: Date) {
        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        }

        if (fromDate || toDate) {
            whereClause.createdAt = {};
            if (fromDate) {
                whereClause.createdAt.gte = fromDate;
            }
            if (toDate) {
                whereClause.createdAt.lte = toDate;
            }
        }

        return this.prisma.order.findMany({
            where: whereClause,
            orderBy: {createdAt: 'desc'},
        });

    }
}
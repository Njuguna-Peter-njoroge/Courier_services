import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    customerId: string;

    @IsString()
    pickupAddress: string;

    @IsString()
    deliveryAddress: string;

    @IsString()
    courierService: string;

    @IsString()
    packageWeight: string;

    @IsString()
    packageDimensions: string;

    @IsString()
    price: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    status?: string; // e.g. "Pending"

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsString()
    orderId?: string; // Let backend generate if not provided
}

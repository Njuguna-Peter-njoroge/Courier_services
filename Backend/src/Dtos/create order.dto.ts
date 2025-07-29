import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  // @IsUUID() // Uncomment if using UUIDs
  customerId: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  courierService: string;

  @IsString()
  packageWeight: string; // Use @IsNumberString() or change to `number` if needed

  @IsString()
  packageDimensions: string;

  @IsString()
  price: string; // Consider changing to number and use @IsNumber()

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  // @IsUUID() // Uncomment if using UUIDs
  orderId?: string;
}

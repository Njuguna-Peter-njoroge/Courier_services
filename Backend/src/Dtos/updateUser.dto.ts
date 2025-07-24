export class UpdateUserDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    zipcode?: string;
    location?: string;
    role?: string;
}
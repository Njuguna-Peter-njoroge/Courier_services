export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  location: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  goodType: string;
  goodWeight: string;
  goodPrice: string;
  goodDescription: string;
  zipcode: string;
}

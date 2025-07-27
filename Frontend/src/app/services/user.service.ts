import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { AccountStatus, UserRole } from '../component/Shared/user.model';

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserFiltersDto {
  status?: AccountStatus;
  role?: UserRole;
  isVerified?: boolean;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  findAll(filters?: UserFiltersDto): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value);
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}`, { ...this.getHeaders(), params });
  }

  findByName(fullName: string): Observable<any[]> {
    const params = new HttpParams().set('search', fullName);
    return this.http.get<any[]>(`${this.apiUrl}`, { ...this.getHeaders(), params });
  }

  async getIdByName(fullName: string): Promise<string | null> {
    const users = await firstValueFrom(this.findByName(fullName));
    return users.length > 0 ? users[0].id : null;
  }

  createUser(dto: CreateUserDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, dto, this.getHeaders());
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, dto, this.getHeaders());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  findById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  changePassword(id: string, dto: ChangePasswordDto): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/password`, dto, this.getHeaders());
  }

}

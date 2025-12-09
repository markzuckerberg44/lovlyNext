import { AuthResponse, LoginData, RegisterData } from '../domain/auth.types';

// Interface siguiendo Dependency Inversion Principle
export interface IAuthRepository {
  register(data: RegisterData): Promise<AuthResponse>;
  login(data: LoginData): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthResponse | null>;
}

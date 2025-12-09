import { IAuthRepository } from '../repositories/auth.repository.interface';
import { AuthResponse, LoginData, RegisterData } from '../domain/auth.types';

// Use Case siguiendo Single Responsibility Principle
export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    // Validaciones de negocio
    if (data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (!data.displayName.trim()) {
      throw new Error('El nombre es requerido');
    }

    return await this.authRepository.register(data);
  }
}

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: LoginData): Promise<AuthResponse> {
    if (!data.email || !data.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    return await this.authRepository.login(data);
  }
}

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'Alumno' | 'Profesor' | 'Administrador';
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  nombre: string;
}

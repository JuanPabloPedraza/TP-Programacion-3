export type RolUsuario = 'Alumno' | 'Profesor' | 'Administrador';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

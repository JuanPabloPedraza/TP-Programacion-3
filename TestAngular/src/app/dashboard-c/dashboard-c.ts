import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
import { RolUsuario, Usuario } from '../interfaces/Usuario';
import { UsuarioService } from '../services/usuario-service';

@Component({
  selector: 'app-dashboard-c',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './dashboard-c.html',
  styleUrl: './dashboard-c.scss',
})
export class DashboardC implements OnInit {
  readonly roles: RolUsuario[] = ['Alumno', 'Profesor', 'Administrador'];
  readonly displayedColumns = ['nombre', 'email', 'rol', 'acciones'];
  readonly currentUserId: number | undefined;
  usuarios: Usuario[] = [];
  pageIndex = 0;
  pageSize = 5;
  totalCount = 0;
  search = '';

  constructor(
    private readonly usuarioService: UsuarioService,
    authService: AuthService
  ) {
    this.currentUserId = authService.getCurrentUser()?.id;
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getPaged(this.pageIndex + 1, this.pageSize, this.search).subscribe({
      next: response => {
        this.usuarios = response.items;
        this.totalCount = response.totalCount;
      },
      error: error => Swal.fire('Error', error?.error?.detail ?? 'No se pudieron cargar los usuarios.', 'error')
    });
  }

  buscar(): void {
    this.pageIndex = 0;
    this.cargarUsuarios();
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarUsuarios();
  }

  cambiarRol(usuario: Usuario, rol: RolUsuario): void {
    this.usuarioService.updateRole(usuario.id, rol).subscribe({
      next: () => {
        usuario.rol = rol;
        void Swal.fire('Rol actualizado', `${usuario.nombre} ahora es ${rol}.`, 'success');
      },
      error: error => {
        void Swal.fire('Error', error?.error?.detail ?? 'No se pudo actualizar el rol.', 'error');
        this.cargarUsuarios();
      }
    });
  }

  eliminar(usuario: Usuario): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará la cuenta de ${usuario.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.usuarioService.delete(usuario.id).subscribe({
        next: () => {
          void Swal.fire('Usuario eliminado', 'La cuenta fue eliminada.', 'success');
          this.cargarUsuarios();
        },
        error: error => Swal.fire('Error', error?.error?.detail ?? 'No se pudo eliminar el usuario.', 'error')
      });
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
import { AlumnoDialogComponent } from '../dialog-agregar-alumno/dialog-agregar-alumno';
import { Alumno } from '../interfaces/Alumno';
import { alumnosService } from '../services/AlumnoService';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './alumnos.html',
  styleUrl: './alumnos.scss',
})
export class AlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'email', 'materia'];
  pageIndex = 0;
  pageSize = 5;
  totalCount = 0;
  search = '';
  readonly canManage: boolean;
  readonly canDelete: boolean;

  constructor(
    private readonly alumnosService: alumnosService,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService
  ) {
    this.canManage = this.authService.hasRole('Administrador', 'Profesor');
    this.canDelete = this.authService.hasRole('Administrador');
    if (this.canManage) this.displayedColumns.push('acciones');
  }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.alumnosService.getPaged(this.pageIndex + 1, this.pageSize, this.search).subscribe({
      next: response => {
        this.alumnos = response.items;
        this.totalCount = response.totalCount;
      },
      error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudieron cargar los alumnos.'), 'error')
    });
  }

  buscar(): void {
    this.pageIndex = 0;
    this.cargarAlumnos();
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarAlumnos();
  }

  agregarAlumno(): void {
    const dialogRef = this.dialog.open(AlumnoDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.alumnosService.create(result).subscribe({
        next: () => {
          void Swal.fire('Listo', 'Alumno agregado correctamente.', 'success');
          this.cargarAlumnos();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo agregar el alumno.'), 'error')
      });
    });
  }

  editarAlumno(alumno: Alumno): void {
    const dialogRef = this.dialog.open(AlumnoDialogComponent, { data: { alumno } });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.alumnosService.update(alumno.id, result).subscribe({
        next: () => {
          void Swal.fire('Guardado', 'Alumno actualizado correctamente.', 'success');
          this.cargarAlumnos();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo actualizar el alumno.'), 'error')
      });
    });
  }

  eliminar(alumno: Alumno): void {
    Swal.fire({
      title: '¿Eliminar alumno?',
      text: `Vas a eliminar a ${alumno.nombre}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.alumnosService.delete(alumno.id).subscribe({
        next: () => {
          void Swal.fire('Eliminado', 'El alumno fue eliminado.', 'success');
          this.cargarAlumnos();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo eliminar el alumno.'), 'error')
      });
    });
  }

  private errorMessage(error: any, fallback: string): string {
    return error?.error?.detail ?? error?.error?.title ?? fallback;
  }
}

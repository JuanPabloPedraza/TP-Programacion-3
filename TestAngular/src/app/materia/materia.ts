import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
import { DialogAgregarMateria } from '../dialog-agregar-materia/dialog-agregar-materia';
import { Materias } from '../interfaces/Materias';
import { MateriaService } from '../services/materia-service';

@Component({
  selector: 'app-materia',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './materia.html',
  styleUrl: './materia.scss',
})
export class Materia implements OnInit {
  materias: Materias[] = [];
  displayedColumns = ['id', 'nombre', 'cantidadAlumnos'];
  pageIndex = 0;
  pageSize = 5;
  totalCount = 0;
  search = '';
  readonly canManage: boolean;
  readonly canDelete: boolean;

  constructor(
    private readonly materiaService: MateriaService,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService
  ) {
    this.canManage = this.authService.hasRole('Administrador', 'Profesor');
    this.canDelete = this.authService.hasRole('Administrador');
    if (this.canManage) this.displayedColumns.push('acciones');
  }

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.materiaService.getPaged(this.pageIndex + 1, this.pageSize, this.search).subscribe({
      next: response => {
        this.materias = response.items;
        this.totalCount = response.totalCount;
      },
      error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudieron cargar las materias.'), 'error')
    });
  }

  buscar(): void {
    this.pageIndex = 0;
    this.cargarMaterias();
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarMaterias();
  }

  agregarMateria(): void {
    const dialogRef = this.dialog.open(DialogAgregarMateria, {
      data: { nombresExistentes: this.materias.map(item => item.nombre) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.materiaService.CrearMateria(result).subscribe({
        next: () => {
          void Swal.fire('Listo', 'Materia agregada correctamente.', 'success');
          this.cargarMaterias();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo agregar la materia.'), 'error')
      });
    });
  }

  editarMateria(materia: Materias): void {
    const dialogRef = this.dialog.open(DialogAgregarMateria, {
      data: { materia, nombresExistentes: this.materias.map(item => item.nombre) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.materiaService.updateMateria(materia.id, { nombre: result.nombre }).subscribe({
        next: () => {
          void Swal.fire('Listo', 'Materia actualizada correctamente.', 'success');
          this.cargarMaterias();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo actualizar la materia.'), 'error')
      });
    });
  }

  eliminar(materia: Materias): void {
    Swal.fire({
      title: '¿Eliminar materia?',
      text: `Se eliminará ${materia.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.materiaService.deleteMateria(materia.id).subscribe({
        next: () => {
          void Swal.fire('Eliminado', 'La materia se eliminó correctamente.', 'success');
          this.cargarMaterias();
        },
        error: error => Swal.fire('Error', this.errorMessage(error, 'No se pudo eliminar la materia.'), 'error')
      });
    });
  }

  private errorMessage(error: any, fallback: string): string {
    return error?.error?.detail ?? error?.error?.title ?? fallback;
  }
}

import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Materias } from '../interfaces/Materias';

@Component({
  selector: 'app-dialog-agregar-materia',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './dialog-agregar-materia.html',
  styleUrl: './dialog-agregar-materia.scss',
})
export class DialogAgregarMateria {
  readonly maxNombreLength = 25;
  readonly nombresExistentes: string[];
  readonly nombreOriginalComparable: string;


  constructor(

    private dialogRef: MatDialogRef<DialogAgregarMateria>,
    @Inject(MAT_DIALOG_DATA) public data: { materia? : Materias, nombresExistentes?: string[] },

  ){
    this.nombre = data?.materia?.nombre ?? '';
    this.nombreOriginalComparable = this.obtenerNombreComparable(data?.materia?.nombre ?? '');
    this.nombresExistentes = (data?.nombresExistentes ?? []).map(nombre => this.obtenerNombreComparable(nombre));
  }

  nombre: string = '';

  get nombreLimpio(): string {
    return this.nombre.trim();
  }

  get nombreComparable(): string {
    return this.obtenerNombreComparable(this.nombre);
  }

  get nombreDuplicado(): boolean {
    if (!this.nombreComparable) {
      return false;
    }

    return this.nombresExistentes.some(nombre => nombre === this.nombreComparable)
      && this.nombreComparable !== this.nombreOriginalComparable;
  }

  get nombreInvalido(): boolean {
    return !this.nombreLimpio || this.nombreLimpio.length > this.maxNombreLength || this.nombreDuplicado;
  }

  confirmar() {
    if (this.nombreInvalido) {
      return;
    }

    this.dialogRef.close({ 

      nombre: this.nombreLimpio,
      
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  private obtenerNombreComparable(nombre: string): string {
    return nombre.trim().toLocaleLowerCase();
  }

}

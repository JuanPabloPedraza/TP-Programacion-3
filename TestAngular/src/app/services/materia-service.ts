
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { Materias } from '../interfaces/Materias';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrearMateriaDto } from '../interfaces/CrearMateriaDto';
import { PagedResult } from '../interfaces/PagedResult';

@Injectable({
  providedIn: 'root',
})
export class MateriaService {


  private ApiUrl: string = `${environment.apiUrl}/Materia`;

  constructor(

    private http: HttpClient

  ) {

  }

  getPaged(pageNumber: number, pageSize: number, search: string): Observable<PagedResult<Materias>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('search', search.trim());
    return this.http.get<PagedResult<Materias>>(this.ApiUrl, { params });
  }

  getAll(): Observable<Materias[]> {
    return this.getPaged(1, 100, '').pipe(map(response => response.items));
  }

  getById(id: number): Observable<Materias> {

    return this.http.get<Materias>(`${this.ApiUrl}/${id}`);

  }

  CrearMateria(materia : CrearMateriaDto): Observable<Materias>{

    return this.http.post<Materias>(this.ApiUrl, materia);

  }

  updateMateria(id: number, materia: CrearMateriaDto): Observable<void> {

    return this.http.put<void>(`${this.ApiUrl}/${id}`, materia);

  }

  deleteMateria(id: number): Observable<void> {

    return this.http.delete<void>(`${this.ApiUrl}/${id}`);

  }





}

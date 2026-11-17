import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResult } from '../interfaces/PagedResult';
import { RolUsuario, Usuario } from '../interfaces/Usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/Usuarios`;

  constructor(private readonly http: HttpClient) {}

  getPaged(pageNumber: number, pageSize: number, search: string): Observable<PagedResult<Usuario>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('search', search.trim());
    return this.http.get<PagedResult<Usuario>>(this.apiUrl, { params });
  }

  updateRole(id: number, rol: RolUsuario): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/rol`, { rol });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from './auth.models';

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
export const AUTH_EXPIRES_AT_KEY = 'auth_expires_at';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly currentUser$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    if (!this.hasValidSession()) {
      this.clearSession();
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  getToken(): string | null {
    if (!this.hasValidSession()) {
      this.clearSession();
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    if (!this.hasValidSession()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  hasRole(...roles: AuthUser['rol'][]): boolean {
    const user = this.userSubject.value;
    return !!user && roles.includes(user.rol);
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
    this.userSubject.next(null);
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, response.expiresAt);
    this.userSubject.next(response.user);
  }

  private hasValidSession(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(AUTH_EXPIRES_AT_KEY);

    if (!token || !expiresAt || Number.isNaN(Date.parse(expiresAt))) {
      return false;
    }

    return Date.parse(expiresAt) > Date.now();
  }

  private readStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      return null;
    }
  }
}

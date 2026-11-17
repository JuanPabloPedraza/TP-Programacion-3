import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import {
  AUTH_EXPIRES_AT_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AuthService
} from './auth.service';
import { AuthResponse } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('stores the session after a successful login', () => {
    const response: AuthResponse = {
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { id: 1, nombre: 'Ada', email: 'ada@example.com', rol: 'Alumno' }
    };

    service.login({ email: 'ada@example.com', password: 'password123' }).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush(response);

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(response.token);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('removes an expired session', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'expired-token');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: 1, nombre: 'Ada', email: 'ada@example.com' }));
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, new Date(Date.now() - 60_000).toISOString());

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });
});

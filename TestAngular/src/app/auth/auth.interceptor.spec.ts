import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AUTH_EXPIRES_AT_KEY, AUTH_TOKEN_KEY } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('adds the bearer token to API requests', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'test-token');
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, new Date(Date.now() + 60_000).toISOString());

    http.get(`${environment.apiUrl}/Alumno`).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/Alumno`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);
  });

  it('clears the session after an unauthorized API response', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'invalid-token');
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, new Date(Date.now() + 60_000).toISOString());

    http.get(`${environment.apiUrl}/Alumno`).subscribe({ error: () => undefined });

    const request = httpTesting.expectOne(`${environment.apiUrl}/Alumno`);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });
});

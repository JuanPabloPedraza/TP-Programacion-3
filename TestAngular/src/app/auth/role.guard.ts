import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.models';

export const roleGuard: CanActivateFn = route => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as AuthUser['rol'][];

  return authService.hasRole(...roles)
    ? true
    : router.createUrlTree(['/home']);
};

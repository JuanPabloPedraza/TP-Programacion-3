import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <app-header />
    <main class="page-content"><router-outlet /></main>
    <app-footer />
  `,
  styles: [`
    :host { min-height: 100vh; display: flex; flex-direction: column; }
    .page-content { flex: 1; }
  `]
})
export class AuthenticatedLayout {}

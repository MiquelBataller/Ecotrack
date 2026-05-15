import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="brand">
        <span class="logo">♻️</span>
        <h1>EcoTrack</h1>
      </div>
      <nav class="main-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          📋 Llista
        </a>
        <a routerLink="/afegir" routerLinkActive="active">
          ➕ Nou Residu
        </a>
      </nav>
    </header>

    <main class="app-main">
      <router-outlet />
    </main>

    <footer class="app-footer">
      <small>EcoTrack — EcoSolutions © 2026</small>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-header {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: white;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo {
      font-size: 1.75rem;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .main-nav {
      display: flex;
      gap: 0.5rem;
    }

    .main-nav a {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .main-nav a:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .main-nav a.active {
      background: rgba(255,255,255,0.25);
      color: white;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
    }

    .app-main {
      flex: 1;
      padding: 1.5rem;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
    }

    .app-footer {
      text-align: center;
      padding: 1rem;
      color: var(--color-text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--color-border);
    }

    @media (max-width: 600px) {
      .app-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }
      .main-nav {
        justify-content: center;
      }
      .app-main {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'EcoTrack';
}
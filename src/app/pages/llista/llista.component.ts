import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResidusService } from '../../services/residus.service';
import { Residu } from '../../models/residu.model';

@Component({
  selector: 'app-llista',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="llista-header">
      <h2>📋 Registre de Residus</h2>
      <div class="accions">
        <button class="btn btn-secondary" (click)="toggleFiltre()">
          @if (mostrarPendents()) {
            👁️ Veure tots
          } @else {
            ⏳ Només pendents
          }
        </button>
        <a routerLink="/afegir" class="btn btn-primary">➕ Nou Residu</a>
      </div>
    </div>

    @if (residus().length === 0) {
      <div class="empty-state card">
        <div class="empty-state-icon">📭</div>
        <h3>No hi ha residus registrats</h3>
        <p>Comença afegint el primer registre de recollida.</p>
        <a routerLink="/afegir" class="btn btn-primary" style="margin-top:1rem">Afegir residu</a>
      </div>
    } @else {
      <div class="residus-grid">
        @for (residu of residus(); track residu.id) {
          <article class="residu-card card">
            <div class="card-header">
              <h3>{{ residu.nom }}</h3>
              <span class="badge" [class]="'badge-' + residu.tipus.toLowerCase()">
                {{ residu.tipus }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">⚖️ Pes:</span>
                <span class="value">{{ residu.pes }} kg</span>
              </div>
              <div class="info-row">
                <span class="label">📅 Data:</span>
                <span class="value">{{ formatejarData(residu.data) }}</span>
              </div>
              <div class="info-row">
                <span class="label">📊 Estat:</span>
                <span class="badge" [class]="'badge-' + residu.estat.toLowerCase()">
                  {{ residu.estat }}
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button 
                type="button"
                class="btn btn-sm"
                [class.btn-estat-pendent]="residu.estat === 'Pendent'"
                [class.btn-estat-processat]="residu.estat === 'Processat'"
                (click)="canviarEstat(residu.id)">
                @if (residu.estat === 'Pendent') {
                  ✓ Marcar processat
                } @else {
                  ↩️ Tornar pendent
                }
              </button>
              <a [routerLink]="['/editar', residu.id]" class="btn btn-sm btn-secondary">✏️ Editar</a>
              <button 
                type="button"
                class="btn btn-sm btn-danger" 
                (click)="eliminar(residu.id, residu.nom)">
                🗑️
              </button>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: [`
    .llista-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .llista-header h2 {
      font-size: 1.4rem;
      color: var(--color-text);
    }
    .accions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .residus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    .residu-card {
      display: flex;
      flex-direction: column;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .residu-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      word-break: break-word;
      flex: 1;
    }
    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
    }
    .info-row .label {
      color: var(--color-text-muted);
    }
    .info-row .value {
      font-weight: 500;
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border);
    }
    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
    }
    .btn-estat-pendent {
      background: var(--color-pendent);
      color: white;
    }
    .btn-estat-pendent:hover {
      background: #D84315;
    }
    .btn-estat-processat {
      background: var(--color-processat);
      color: white;
    }
    .btn-estat-processat:hover {
      background: var(--color-primary-dark);
    }
    @media (max-width: 600px) {
      .llista-header {
        flex-direction: column;
        align-items: stretch;
      }
      .accions {
        justify-content: stretch;
      }
      .accions .btn, .accions a {
        flex: 1;
        text-align: center;
      }
      .residus-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LlistaComponent implements OnInit {
  residus = signal<Residu[]>([]);
  mostrarPendents = signal(false);

  constructor(private residusService: ResidusService) {}

  async ngOnInit() {
    await this.carregarResidus();
  }

  async carregarResidus() {
    try {
      const dades = this.mostrarPendents()
        ? await this.residusService.obtenirResidusPendents()
        : await this.residusService.obtenirResidus();
      this.residus.set(dades);
    } catch (err) {
      console.error("Error carregant residus:", err);
    }
  }

  async toggleFiltre() {
    this.mostrarPendents.update(v => !v);
    await this.carregarResidus();
  }

  async canviarEstat(id: string) {
    try {
      await this.residusService.canviarEstat(id);
      await this.carregarResidus();
    } catch (err) {
      console.error("Error canviant estat:", err);
      alert("Error al canviar l'estat. Revisa la consola.");
    }
  }

  async eliminar(id: string, nom: string) {
    if (confirm("Vols eliminar " + nom + " permanentment?")) {
      try {
        await this.residusService.eliminarResidu(id);
        await this.carregarResidus();
      } catch (err) {
        console.error("Error eliminant:", err);
        alert("Error al eliminar. Revisa la consola.");
      }
    }
  }

  formatejarData(dataISO: string): string {
    const [any, mes, dia] = dataISO.split('-');
    return dia + "/" + mes + "/" + any;
  }
}
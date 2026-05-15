import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResidusService } from '../../services/residus.service';
import { Residu, TipusResidu, EstatResidu } from '../../models/residu.model';

@Component({
  selector: 'app-formulari',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="formulari-container">
      <h2>{{ esEdicio() ? '✏️ Editar Residu' : '➕ Nou Residu' }}</h2>

      <form (ngSubmit)="guardar()" class="card form-card">
        <div class="form-group">
          <label for="nom">Nom del residu *</label>
          <input id="nom" type="text" class="form-control" [(ngModel)]="residu.nom" name="nom" required placeholder="Ex: Dissolvent industrial">
        </div>

        <div class="form-group">
          <label for="tipus">Tipus *</label>
          <select id="tipus" class="form-control" [(ngModel)]="residu.tipus" name="tipus" required>
            <option value="" disabled>Selecciona un tipus</option>
            @for (t of tipusDisponibles; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="pes">Pes (kg) *</label>
          <input id="pes" type="number" step="0.01" min="0" class="form-control" [(ngModel)]="residu.pes" name="pes" required placeholder="0.00">
        </div>

        <div class="form-group">
          <label for="data">Data de recollida *</label>
          <input id="data" type="date" class="form-control" [(ngModel)]="residu.data" name="data" required>
        </div>

        <div class="form-group">
          <label for="estat">Estat *</label>
          <select id="estat" class="form-control" [(ngModel)]="residu.estat" name="estat" required>
            @for (e of estatsDisponibles; track e) {
              <option [value]="e">{{ e }}</option>
            }
          </select>
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="carregant()">
            {{ carregant() ? '💾 Guardant...' : (esEdicio() ? '💾 Actualitzar' : '💾 Crear Residu') }}
          </button>
          <a routerLink="/" class="btn btn-secondary">❌ Cancel·lar</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .formulari-container {
      max-width: 500px;
      margin: 0 auto;
    }

    .formulari-container h2 {
      margin-bottom: 1.25rem;
      font-size: 1.3rem;
    }

    .form-card {
      padding: 1.5rem;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }

    .form-actions .btn {
      flex: 1;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .alert-error {
      background: #FFEBEE;
      color: var(--color-error);
      border: 1px solid #EF9A9A;
    }

    button[type="submit"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .formulari-container {
        max-width: 100%;
      }
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class FormulariComponent implements OnInit {
  esEdicio = signal(false);
  carregant = signal(false);
  error = signal<string | null>(null);

  tipusDisponibles: TipusResidu[] = ['Perillós', 'Reciclable', 'Especial'];
  estatsDisponibles: EstatResidu[] = ['Pendent', 'Processat'];

  residu: Partial<Residu> = {
    nom: '',
    tipus: '' as TipusResidu,
    pes: undefined as any,
    data: new Date().toISOString().split('T')[0],
    estat: 'Pendent'
  };

  private idEdicio: string | null = null;

  constructor(
    private residusService: ResidusService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.idEdicio = this.route.snapshot.paramMap.get('id');
    if (this.idEdicio) {
      this.esEdicio.set(true);
      const existent = await this.residusService.obtenirResiduPerId(this.idEdicio);
      if (existent) {
        this.residu = { ...existent };
      } else {
        this.error.set('Residu no trobat');
      }
    }
  }

  async guardar() {
    this.error.set(null);

    if (!this.residu.nom?.trim() || !this.residu.tipus || !this.residu.pes || !this.residu.data || !this.residu.estat) {
      this.error.set('Tots els camps són obligatoris');
      return;
    }

    this.carregant.set(true);
    try {
      if (this.esEdicio() && this.idEdicio) {
        await this.residusService.actualitzarResidu(this.idEdicio, this.residu);
      } else {
        await this.residusService.afegirResidu(this.residu as Omit<Residu, 'id'>);
      }
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set('Error al guardar: ' + (err.message || 'Desconegut'));
    } finally {
      this.carregant.set(false);
    }
  }
}
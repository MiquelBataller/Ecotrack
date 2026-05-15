import { Injectable } from '@angular/core';
import { Residu, TipusResidu, EstatResidu } from '../models/residu.model';

interface StoreWithTransaction {
  store: IDBObjectStore;
  transaction: IDBTransaction;
}

@Injectable({
  providedIn: 'root'
})
export class ResidusService {

  private readonly DB_NAME = 'EcoTrackDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'residus';

  private db: IDBDatabase | null = null;

  constructor() {
    this.inicialitzarDB();
  }

  private inicialitzarDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('estat', 'estat', { unique: false });
          store.createIndex('tipus', 'tipus', { unique: false });
        }
      };
    });
  }

  private async getStore(mode: IDBTransactionMode): Promise<StoreWithTransaction> {
    const db = await this.inicialitzarDB();
    const transaction = db.transaction(this.STORE_NAME, mode);
    return { store: transaction.objectStore(this.STORE_NAME), transaction };
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  async obtenirResidus(): Promise<Residu[]> {
    const { store } = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const residus = request.result as Residu[];
        residus.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        resolve(residus);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async obtenirResidusPendents(): Promise<Residu[]> {
    const tots = await this.obtenirResidus();
    return tots.filter(r => r.estat === 'Pendent');
  }

  async obtenirResiduPerId(id: string): Promise<Residu | undefined> {
    const { store } = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as Residu | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async afegirResidu(dades: Omit<Residu, 'id'>): Promise<string> {
    const { store, transaction } = await this.getStore('readwrite');
    const id = this.generarId();
    const nouResidu: Residu = { ...dades, id };

    return new Promise((resolve, reject) => {
      const request = store.add(nouResidu);
      transaction.oncomplete = () => resolve(id);
      transaction.onerror = () => reject(transaction.error);
      request.onerror = () => reject(request.error);
    });
  }

  async actualitzarResidu(id: string, canvis: Partial<Residu>): Promise<void> {
    const { store, transaction } = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existent = getRequest.result as Residu | undefined;
        if (!existent) {
          reject(new Error("Residu amb id " + id + " no trobat"));
          return;
        }
        const actualitzat: Residu = { ...existent, ...canvis, id };
        const putRequest = store.put(actualitzat);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async canviarEstat(id: string): Promise<void> {
    const { store, transaction } = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const residu = getRequest.result as Residu | undefined;
        if (!residu) {
          reject(new Error("Residu no trobat"));
          return;
        }
        const nouEstat: EstatResidu = residu.estat === 'Pendent' ? 'Processat' : 'Pendent';
        const actualitzat: Residu = { ...residu, estat: nouEstat };
        const putRequest = store.put(actualitzat);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async eliminarResidu(id: string): Promise<void> {
    const { store, transaction } = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      request.onerror = () => reject(request.error);
    });
  }

  async afegirDadesProva(): Promise<void> {
    const existents = await this.obtenirResidus();
    if (existents.length > 0) return;

    const mostres: Omit<Residu, 'id'>[] = [
      { nom: 'Dissolvent industrial', tipus: 'Perillós', pes: 45.5, data: '2026-05-10', estat: 'Pendent' },
      { nom: 'Paper de oficina', tipus: 'Reciclable', pes: 12.3, data: '2026-05-12', estat: 'Processat' },
      { nom: 'Bateries alcalines', tipus: 'Especial', pes: 8.0, data: '2026-05-14', estat: 'Pendent' },
    ];

    for (const dada of mostres) {
      await this.afegirResidu(dada);
    }
  }
}
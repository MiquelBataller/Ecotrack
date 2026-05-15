export type TipusResidu = 'Perillós' | 'Reciclable' | 'Especial';
export type EstatResidu = 'Pendent' | 'Processat';

export interface Residu {
  id: string;
  nom: string;
  tipus: TipusResidu;
  pes: number;
  data: string;
  estat: EstatResidu;
}

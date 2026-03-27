import { Card } from "./card.model";

export type Role =
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'NEUTRE'
  | 'VICE_TROUDUC'
  | 'TROUDUC';

export interface Player {
  id: number;
  name: string;
  role: Role;
  hand: Card[];
  score: number;
  hasPassed: boolean;
  avatar?: string; // optionnel
}


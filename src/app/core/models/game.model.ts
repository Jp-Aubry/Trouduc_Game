import { Card } from "./card.model";

export type GamePhase =
  | 'SETUP'
  | 'DISTRIBUTION'
  | 'REDISTRIBUTION'
  | 'PLAYING'
  | 'ROUND_END'
  | 'GAME_END';

export interface Trick {
  cards: Card[];
  count: number;
  strength: number;
  playedBy: number; // player.id
}

export interface TrickHistoryEntry {
  cards: Card[];
  winnerId: number;
  plays: Trick[]; // toutes les combinaisons jouées dans ce pli
}

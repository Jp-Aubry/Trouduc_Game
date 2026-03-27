export type CardValue =
  | 'JOKER'
  | '2'
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3';

export const CARD_STRENGTH: Record<CardValue, number> = {
  JOKER: 15,
  '2': 14,
  A: 13,
  K: 12,
  Q: 11,
  J: 10,
  '10': 9,
  '9': 8,
  '8': 7,
  '7': 6,
  '6': 5,
  '5': 4,
  '4': 3,
  '3': 2,
};

export type CardSuit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'JOKER';

export interface Card {
  uid: string;   // 👈 identifiant unique
  value: CardValue;
  suit: CardSuit;
  strength: number;
}


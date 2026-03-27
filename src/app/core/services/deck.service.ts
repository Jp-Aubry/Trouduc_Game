import { Injectable } from '@angular/core';
import { Card, CardValue, CARD_STRENGTH, CardSuit } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class DeckService {

  createDeck(): Card[] {
    const deck: Card[] = [];

    const values: CardValue[] = [
      '2', 'A', 'K', 'Q', 'J',
      '10', '9', '8', '7', '6', '5', '4', '3'
    ];

const suits: CardSuit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];

for (const suit of suits) {
  for (const value of values) {
    deck.push({
      uid: crypto.randomUUID(), 
      value,
      suit,
      strength: CARD_STRENGTH[value],
    });
  }
}

// joker
deck.push({uid: crypto.randomUUID(), value: 'JOKER', suit: 'JOKER', strength: 15 });

    return deck;
  }

  shuffle(deck: Card[]): Card[] {
  return [...deck].sort(() => Math.random() - 0.5);
}

}

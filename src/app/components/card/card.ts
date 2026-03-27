import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class CardComponent {

  @Input({ required: true }) card!: Card;

  /** Carte visible ou dos */
  @Input() faceUp = true;

  /** Carte sélectionnée */
  @Input() selected = false;

  @Input() disabled = false;

  @Output() toggle = new EventEmitter<Card>();

get imagePath(): string {
  if (this.card.value === 'JOKER') {
    return 'assets/cards/red_joker.png'; // si tu en as un
  }

  const valueMap: Record<string, string> = {
    A: 'ace',
    K: 'king',
    Q: 'queen',
    J: 'jack',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2',
  };

  const suitMap: Record<string, string> = {
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds',
    SPADES: 'spades',
    CLUBS: 'clubs',
  };

  const value = valueMap[this.card.value];
  const suit = suitMap[this.card.suit];

  return `assets/cards/${value}_of_${suit}.png`;
}





  onClick() {
    if (!this.faceUp) return;
    this.toggle.emit(this.card);
  }
}

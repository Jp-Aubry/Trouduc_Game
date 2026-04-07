import { Component, EventEmitter, Input, Output, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../core/models/player.model';
import { SeatPosition } from '../../core/models/seat-position.model';
import { CardComponent } from '../card/card';
import { Card, CARD_STRENGTH, CardValue } from '../../core/models/card.model';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-player-seat',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './player-seat.html',
  styleUrl: './player-seat.css',
})
export class PlayerSeat implements OnChanges {

  @Input({ required: true }) player!: Player;
  @Input({ required: true }) position!: SeatPosition;
  @Input() playingCards: Card[] = [];
  @Input() resetSelection = false;
  @Output() selectionChange = new EventEmitter<Card[]>();

  selectedCards = new Set<Card>();
  isMe = computed(() => this.position === 'bottom');

  // ✅ Joker
  showJokerMenu = false;
  pendingJoker: Card | null = null;

  constructor(private gameService: GameService) {}

  onToggle(card: Card) {
    if (!this.isPlayable(card)) return;

    // ✅ Si c'est un Joker → ouvrir le menu
    if (card.value === 'JOKER' && !this.selectedCards.has(card)) {
      this.pendingJoker = card;
      this.showJokerMenu = true;
      return;
    }

    if (this.selectedCards.has(card)) {
      this.selectedCards.delete(card);
    } else {
      this.selectedCards.add(card);
    }

    this.selectionChange.emit([...this.selectedCards]);
  }

  onJokerValueSelected(value: CardValue) {
    if (!this.pendingJoker) return;

    // Cloner le joker avec la valeur choisie
    const jokerWithValue: Card = {
      ...this.pendingJoker,
      value,
    };

    this.selectedCards.add(jokerWithValue);
    this.selectionChange.emit([...this.selectedCards]);

    this.showJokerMenu = false;
    this.pendingJoker = null;
  }

  cancelJokerMenu() {
    this.showJokerMenu = false;
    this.pendingJoker = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetSelection'] && changes['resetSelection'].currentValue) {
      this.selectedCards.clear();
      this.showJokerMenu = false;
      this.pendingJoker = null;
      this.selectionChange.emit([]);
    }
  }

  isPlayable(card: Card): boolean {
    if (!this.isMe()) return true;

    const trick = this.gameService.currentTrick();
    const alreadySelected = this.selectedCards.has(card);

    if (!trick) {
      if (this.selectedCards.size > 0 && !alreadySelected) {
        const first = [...this.selectedCards][0];
        return card.strength === first.strength;
      }
      return true;
    }

    if (card.value === 'JOKER') return true;

    if (alreadySelected) return true;

    if (this.selectedCards.size >= trick.count) return false;

    if (this.selectedCards.size > 0) {
      const first = [...this.selectedCards][0];
      if (card.strength !== first.strength) return false;
    }

    return card.strength >= trick.strength;
  }

  get jokerValues(): CardValue[] {
  const allValues: CardValue[] = ['2', 'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
  
  const trick = this.gameService.currentTrick();

  // Pas de pli → toutes les valeurs sont disponibles sauf JOKER
  if (!trick) return allValues;

  // Filtrer uniquement les valeurs de force >= au pli courant
  return allValues.filter(value => {
    const strength = CARD_STRENGTH[value];
    return strength >= trick.strength;
  });
}
}
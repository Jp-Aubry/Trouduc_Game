import { Component, EventEmitter, Input, Output, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../core/models/player.model';
import { SeatPosition } from '../../core/models/seat-position.model';
import { CardComponent } from '../card/card';
import { Card } from '../../core/models/card.model';
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
  @Input() resetSelection = false; // pour vider la sélection depuis le parent
  @Output() selectionChange = new EventEmitter<Card[]>();

  selectedCards = new Set<Card>();
  isMe = computed(() => this.position === 'bottom');

  
  constructor(private gameService: GameService) {}

 onToggle(card: Card) {
  if (!this.isPlayable(card)) return; // ✅ bloquer si non jouable

  if (this.selectedCards.has(card)) {
    this.selectedCards.delete(card);
  } else {
    this.selectedCards.add(card);
  }

  this.selectionChange.emit([...this.selectedCards]);
}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetSelection'] && changes['resetSelection'].currentValue) {
      this.selectedCards.clear();
      this.selectionChange.emit([]); // notifier le parent
    }
  }

    // ✅ Détermine si une carte est jouable
 isPlayable(card: Card): boolean {
  if (!this.isMe()) return true;

  const trick = this.gameService.currentTrick();
  const alreadySelected = this.selectedCards.has(card);

  if (!trick) {
    // Pas de pli : on peut sélectionner uniquement des cartes de même valeur
    if (this.selectedCards.size > 0 && !alreadySelected) {
      const first = [...this.selectedCards][0];
      return card.strength === first.strength;
    }
    return true;
  }

  if (card.value === 'JOKER') return true;

  // Carte déjà sélectionnée → toujours "jouable" (pour pouvoir la désélectionner)
  if (alreadySelected) return true;

  // Quota atteint → bloquer toute nouvelle sélection
  if (this.selectedCards.size >= trick.count) return false;

  // Doit avoir la même valeur que les cartes déjà sélectionnées
  if (this.selectedCards.size > 0) {
    const first = [...this.selectedCards][0];
    if (card.strength !== first.strength) return false;
  }

  // Force >= au pli
  return card.strength >= trick.strength;
}
}

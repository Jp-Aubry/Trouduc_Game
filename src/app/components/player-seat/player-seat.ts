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
    if (this.selectedCards.has(card)) {
      this.selectedCards.delete(card);
    } else {
      this.selectedCards.add(card);
    }

    // émettre une **copie** pour éviter de partager la référence
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
    if (!this.isMe()) return true; // les autres joueurs voient leurs cartes cachées

    const trick = this.gameService.currentTrick();
    if (!trick) return true; // pas de pli → tout jouable
    if (card.value === 'JOKER') return true; // Joker toujours jouable

    // Pour l'instant, on ne gère que la sélection d'une carte seule
    // Plus tard tu peux gérer paires, triples, etc.
    return card.strength >= trick.strength;
  }
}

import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { MaterialModule } from '../../material/material.module';
import { PlayerSeat } from '../../components/player-seat/player-seat';
import { SeatPosition } from '../../core/models/seat-position.model';
import { Card } from '../../core/models/card.model';
import { CardComponent } from '../../components/card/card';
import { Player } from '../../core/models/player.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PlayerSeat,
    CardComponent,
    NgStyle
  ],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class GameComponent {

  constructor(public gameService: GameService) { }

  selectedCards = signal<Card[]>([]);

  // --------- getters vers GameService (signals) ---------

  get players() {
    return this.gameService.players;
  }

  get phase() {
    return this.gameService.phase;
  }

  get currentPlayerIndex() {
    return this.gameService.currentPlayerIndex;
  }

  get currentTrick() {
    return this.gameService.currentTrick;
  }

  // --------- joueur courant ---------

  currentPlayer = computed<Player | null>(() => {
    const players = this.players();
    const index = this.currentPlayerIndex();
    if (!players.length) return null;
    return players[index] ?? null;
  });

  // --------- layout dynamique ---------

  private readonly seatLayouts: Record<number, SeatPosition[]> = {
    3: ['bottom', 'right', 'left'],
    4: ['bottom', 'right', 'top', 'left'],
    5: ['bottom', 'bottom-right', 'right', 'top', 'left'],
    6: ['bottom', 'bottom-right', 'right', 'top', 'top-left', 'left'],
    7: ['bottom', 'bottom-right', 'right', 'top-right', 'top', 'top-left', 'left'],
  };

  readonly seats = computed(() => {
    const players = this.players();
    const layout = this.seatLayouts[players.length];
    if (!layout) return [];
    return players.map((player, index) => ({
      player,
      position: layout[index],
    }));
  });

  // --------- actions UI ---------

  start() {
    this.gameService.initGame(['OLivier', 'JP', 'Baptou', 'Julien']);
    this.gameService.distributeCards();
    this.gameService.redistributeCards();
  }

  pass() {
    const player = this.currentPlayer();
    if (!player) return;
    this.gameService.pass(player.id);
  }

  onSelectionChange(cards: Card[]) {
    this.selectedCards.set(cards);
  }

  play() {
    const cardsToPlay = [...this.selectedCards()];
    if (!cardsToPlay.length) return;

    const player = this.currentPlayer();
    if (!player) return;

    this.gameService.playCards(player.id, cardsToPlay);
    this.selectedCards.set([]);
  }

  get trickWinner() {
    return this.gameService.trickWinner;
  }

  get trickId() {
    return this.gameService.trickId;
  }

  get trickStack() {
    return this.gameService.trickStack;
  }

  getCardRotation(index: number): number {
    const rotations = [-8, 5, -3, 9, -6, 4, -7, 3, -5, 8];
    return rotations[index % rotations.length];
  }

  getCardStyle(index: number): Record<string, string> {
  // Pseudo-aléatoire déterministe basé sur l'index
  const seed = (index * 2654435761) >>> 0; // hash simple
  const rotation = ((seed % 3200) / 100) - 16; // entre -16 et +16 degrés
  const offsetX = ((seed >> 4) % 24) - 12;     // entre -12 et +12 px
  const offsetY = ((seed >> 8) % 16) - 8;      // entre -8 et +8 px

  return {
    transform: `translate(-50%, -50%) rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
    zIndex: String(index),
    animationDelay: '0s',
  };
}

  confirmTrick() {
    this.gameService.confirmTrick();
  }
}
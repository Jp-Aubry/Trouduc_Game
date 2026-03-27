import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { MaterialModule } from '../../material/material.module';
import { PlayerSeat } from '../../components/player-seat/player-seat';
import { SeatPosition } from '../../core/models/seat-position.model';
import { Card } from '../../core/models/card.model';
import { CardComponent } from '../../components/card/card';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PlayerSeat,
    CardComponent
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
}
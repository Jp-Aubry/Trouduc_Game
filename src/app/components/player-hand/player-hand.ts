import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Player } from '../../core/models/player.model';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule],
  templateUrl: './player-hand.html',
})
export class PlayerHand {

  @Input() player!: Player;
  @Output() play = new EventEmitter<Card[]>();

  selected: Card[] = [];

  toggle(card: Card) {
    this.selected.includes(card)
      ? this.selected = this.selected.filter(c => c !== card)
      : this.selected.push(card);
  }

  submit() {
    this.play.emit(this.selected);
    this.selected = [];
  }
}

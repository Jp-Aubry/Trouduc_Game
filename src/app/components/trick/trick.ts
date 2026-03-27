import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-trick',
  imports: [CommonModule],
  templateUrl: './trick.html',
  styleUrl: './trick.css',
  standalone: true
})
export class Trick {
constructor(public game: GameService) {}
}

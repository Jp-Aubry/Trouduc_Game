import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

  constructor(
    private router: Router,
    private gameService: GameService
  ) {}

  playersCount = signal<number>(4); // valeur par défaut

  startGame() {
    const count = this.playersCount();

    // noms temporaires
    const names = Array.from({ length: count }, (_, i) => `Joueur ${i + 1}`);

    this.gameService.initGame(names);
    this.gameService.distributeCards();
    this.gameService.redistributeCards();

    this.router.navigate(['/game']);
  }

  increase() {
  this.playersCount.set(Math.min(7, this.playersCount() + 1));
}

decrease() {
  this.playersCount.set(Math.max(3, this.playersCount() - 1));
}

}

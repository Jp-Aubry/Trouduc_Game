import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home';
import { GameComponent } from './views/game/game';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: '**', redirectTo: '' },
];

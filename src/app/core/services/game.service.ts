import { Injectable, signal } from '@angular/core';
import { Player, Role } from '../models/player.model';
import { GamePhase, Trick, TrickHistoryEntry } from '../models/game.model';
import { DeckService } from './deck.service';
import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class GameService {

  // -------------------
  // ÉTAT DU JEU
  // -------------------

  private readonly _players = signal<Player[]>([]);
  readonly players = this._players.asReadonly();

  private readonly _phase = signal<GamePhase>('SETUP');
  readonly phase = this._phase.asReadonly();

  private readonly _trickHistory = signal<TrickHistoryEntry | null>(null)
  readonly trickHistory = this._trickHistory.asReadonly();

  private readonly _currentPlayerIndex = signal<number>(0);
  readonly currentPlayerIndex = this._currentPlayerIndex.asReadonly();

  private readonly _round = signal<number>(1);
  readonly round = this._round.asReadonly();

  private readonly _currentTrick = signal<Trick | null>(null);
  readonly currentTrick = this._currentTrick.asReadonly();

  private readonly _passedPlayers = signal<Set<number>>(new Set());

  private readonly _finishOrder = signal<number[]>([]);
  readonly finishOrder = this._finishOrder.asReadonly();

  private readonly _trickWinner = signal<Player | null>(null);
  readonly trickWinner = this._trickWinner.asReadonly();



  constructor(private deckService: DeckService) { }

  // -------------------
  // INITIALISATION
  // -------------------

  initGame(playerNames: string[]) {
    if (playerNames.length < 3 || playerNames.length > 7) {
      throw new Error('Le jeu doit contenir entre 3 et 7 joueurs.');
    }

    const players: Player[] = playerNames.map((name, index) => ({
      id: index,
      name,
      role: 'NEUTRE',
      hand: [],
      score: 0,
      hasPassed: false,
    }));

    this._players.set(players);
    this._currentPlayerIndex.set(0);
    this._phase.set('DISTRIBUTION');
  }

  // -------------------
  // DISTRIBUTION
  // -------------------

  distributeCards() {
    const deck = this.deckService.shuffle(this.deckService.createDeck());

    const players: Player[] = this._players().map(player => ({
      ...player,
      hand: [],
      hasPassed: false,
    }));

    let cardIndex = 0;
    while (cardIndex < deck.length) {
      players[cardIndex % players.length].hand.push(deck[cardIndex]);
      cardIndex++;
    }

    // Trier la main de chaque joueur par force croissante
    players.forEach(player => {
      player.hand.sort((a, b) => a.strength - b.strength);
    });

    this._players.set(players);
    this.assignInitialRoles();
    this._phase.set('REDISTRIBUTION');
  }

  // -------------------
  // ATTRIBUTION DES RÔLES
  // -------------------

  private assignInitialRoles() {
    const shuffled = [...this._players()].sort(() => Math.random() - 0.5);
    this.assignRolesByOrder(shuffled);
  }

  private assignRolesByOrder(orderedPlayers: Player[]) {

    // ✅ PREMIER TOUR → tout le monde neutre
    if (this._round() === 1) {
      const updatedPlayers = orderedPlayers.map(player => ({
        ...player,
        role: 'NEUTRE' as Role,
      }));

      this._players.set(updatedPlayers);
      return;
    }

    // ✅ TOURS SUIVANTS → logique normale
    const count = orderedPlayers.length;
    const roles: Role[] = [];

    roles.push('PRESIDENT');
    roles.push('VICE_PRESIDENT');

    const intermediatesCount = Math.max(0, count - 4);
    for (let i = 0; i < intermediatesCount; i++) {
      roles.push('NEUTRE');
    }

    roles.push('VICE_TROUDUC');
    roles.push('TROUDUC');

    const updatedPlayers = orderedPlayers.map((player, index) => ({
      ...player,
      role: roles[index],
    }));

    this._players.set(updatedPlayers);
  }

  // -------------------
  // REDISTRIBUTION
  // -------------------

  redistributeCards() {
    const players = this._players().map(player => ({
      ...player,
      hand: [...player.hand],
    }));

    // ✅ Pas de redistribution à 3 joueurs
    if (players.length < 4) {
      this._players.set(players);
      this._phase.set('PLAYING');
      return;
    }

    // ✅ NOUVEAU : détecter si des rôles existent
    const hasRoles = players.some(p => p.role !== 'NEUTRE');

    // 👉 Premier tour → pas de redistribution
    if (!hasRoles) {
      this._players.set(players);
      this._phase.set('PLAYING');
      return;
    }

    // ✅ Récupération des rôles
    const president = players.find(p => p.role === 'PRESIDENT');
    const vicePresident = players.find(p => p.role === 'VICE_PRESIDENT');
    const viceTrouduc = players.find(p => p.role === 'VICE_TROUDUC');
    const trouduc = players.find(p => p.role === 'TROUDUC');

    // ⚠️ Sécurité (mais ne devrait plus arriver normalement)
    if (!president || !trouduc) {
      console.warn('Redistribution ignorée : rôles incomplets');
      this._players.set(players);
      this._phase.set('PLAYING');
      return;
    }

    // ✅ Échanges
    this.exchangeCards(trouduc, president, 2);

    if (vicePresident && viceTrouduc) {
      this.exchangeCards(viceTrouduc, vicePresident, 1);
    }

    // Re-trier après échanges
    players.forEach(player => {
      player.hand.sort((a, b) => a.strength - b.strength);
    });

    this._players.set(players);
    this._phase.set('PLAYING');
  }
  private exchangeCards(from: Player, to: Player, count: number) {
    from.hand.sort((a, b) => b.strength - a.strength);
    to.hand.sort((a, b) => a.strength - b.strength);

    const given = from.hand.splice(0, count);
    const received = to.hand.splice(0, count);

    from.hand.push(...received);
    to.hand.push(...given);
  }

  // -------------------
  // JEU / ENCHÈRES
  // -------------------

  playCards(playerId: number, cards: Card[]) {
    if (this._phase() !== 'PLAYING') {
      throw new Error('Le jeu n\'est pas en cours');
    }

    if (!this.isValidPlay(cards)) {
      throw new Error('Coup invalide');
    }

    const players = this._players().map(p => ({
      ...p,
      hand: [...p.hand],
    }));

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // retirer cartes
    cards.forEach(card => {
      const index = player.hand.findIndex(c => c.uid === card.uid);
      if (index >= 0) {
        player.hand.splice(index, 1);
      }
    });

    // joueur fini ?
    if (player.hand.length === 0) {
      const order = [...this._finishOrder()];
      if (!order.includes(player.id)) {
        order.push(player.id);
        this._finishOrder.set(order);
      }

      this._players.set(players);
      this.checkEndOfRound();
      return;
    }

    // joker
    if (this.isJokerPlay(cards)) {
      this._currentTrick.set(null);
      this._passedPlayers.set(new Set());
      this._players.set(players);
      return;
    }

    // enregistrer le pli
    this._currentTrick.set({
      cards: cards.map(c => ({ ...c })),
      count: cards.length,
      strength: this.getPlayStrength(cards),
      playedBy: playerId,
    });

    this._passedPlayers.set(new Set());
    this._players.set(players);

    // ✅ Carte maître (2 ou Joker) → fin de pli immédiate
    if (this.isMasterPlay(cards)) {
      const winner = players.find(p => p.id === playerId) ?? null;
      this._trickWinner.set(winner);
      return;
    }

    // fin de pli normale ?
    if (this.checkEndOfTrick()) return;

    this.nextPlayer();
  }

  pass(playerId: number) {
    const passed = new Set(this._passedPlayers());
    passed.add(playerId);
    this._passedPlayers.set(passed);

    if (this.checkEndOfTrick()) {
      return; // gagnant rejoue
    }

    this.nextPlayer();
  }


  // -------------------
  // VALIDATION DES COUPS
  // -------------------

  private allSameValue(cards: Card[]): boolean {
    return cards.every(card => card.strength === cards[0].strength);
  }

  private isJokerPlay(cards: Card[]): boolean {
    return cards.length === 1 && cards[0].value === 'JOKER';
  }

  private getPlayStrength(cards: Card[]): number {
    return Math.max(...cards.map(card => card.strength));
  }

  private isValidPlay(cards: Card[]): boolean {

    // 1️⃣ coup vide
    if (!cards || cards.length === 0) {
      return false;
    }

    // 2️⃣ joker seul
    if (this.isJokerPlay(cards)) {
      return true;
    }

    // 3️⃣ toutes les cartes jouées doivent être identiques
    if (!this.allSameValue(cards)) {
      return false;
    }

    const currentTrick = this._currentTrick();

    // 4️⃣ premier coup du pli → tout est autorisé
    if (!currentTrick) {
      return true;
    }

    // 5️⃣ même nombre de cartes que le pli courant
    if (cards.length !== currentTrick.count) {
      return false;
    }

    // 6️⃣ force STRICTEMENT supérieure
    return this.getPlayStrength(cards) >= currentTrick.strength;
  }


  // -------------------
  // TOUR DE JEU
  // -------------------

  get currentPlayer(): Player {
    return this._players()[this._currentPlayerIndex()];
  }

  nextPlayer() {
    const players = this._players();
    const passed = this._passedPlayers();

    let nextIndex = this._currentPlayerIndex();

    do {
      nextIndex = (nextIndex + 1) % players.length;
    } while (passed.has(players[nextIndex].id));

    this._currentPlayerIndex.set(nextIndex);
  }


  private checkEndOfTrick(): boolean {
    const players = this._players();
    const passed = this._passedPlayers();
    const trick = this._currentTrick();

    if (!trick) return false;

    if (passed.size === players.length - 1) {
      const winner = players.find(p => p.id === trick.playedBy) ?? null;

      // ✅ Signaler le gagnant AVANT de vider le pli
      this._trickWinner.set(winner);

      return true;
    }

    return false;
  }

  private isMasterPlay(cards: Card[]): boolean {
    if (this.isJokerPlay(cards)) return true;
    return cards.every(c => c.value === '2');
  }

  confirmTrick() {
    const trick = this._currentTrick();
    const winner = this._trickWinner();

    if (!winner) return;

    const winnerIndex = this._players().findIndex(p => p.id === winner.id);

    this._currentTrick.set(null);
    this._passedPlayers.set(new Set());
    this._trickWinner.set(null);

    if (winnerIndex >= 0) {
      this._currentPlayerIndex.set(winnerIndex);
    }
  }


  private checkEndOfRound() {
    const players = this._players();
    const finished = this._finishOrder();

    // Manche terminée quand tous les joueurs sont classés
    if (finished.length === players.length) {
      this.endRound();
    }
  }

  private endRound() {
    this._phase.set('ROUND_END');

    const players = [...this._players()];
    const finishOrder = this._finishOrder();

    // Attribution des rôles selon l'ordre
    const roleMap = new Map<number, Role>();

    roleMap.set(finishOrder[0], 'PRESIDENT');
    roleMap.set(finishOrder[1], 'VICE_PRESIDENT');

    if (players.length > 4) {
      for (let i = 2; i < finishOrder.length - 2; i++) {
        roleMap.set(finishOrder[i], 'NEUTRE');
      }
    }

    roleMap.set(finishOrder[finishOrder.length - 2], 'VICE_TROUDUC');
    roleMap.set(finishOrder[finishOrder.length - 1], 'TROUDUC');

    const updatedPlayers = players.map(player => ({
      ...player,
      role: roleMap.get(player.id) ?? player.role,
      hasPassed: false,
    }));

    this._players.set(updatedPlayers);

    // Préparer la manche suivante
    this._round.update(r => r + 1);
    this._finishOrder.set([]);
    this._currentTrick.set(null);
    this._passedPlayers.set(new Set());
  }

}

// src/app/battle/battle.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SwapiService } from '../core/services/swapi.service';
import { BattleService } from '../core/services/battle.service';
import { StorageService } from '../core/services/storage.service';
import { Character } from '../core/models/character';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css']
})
export class BattleComponent {
  character1: Character | null = null;
  character2: Character | null = null;
  loading = false;
  winner: Character | null = null;
  battleLog: string[] = [];
  currentAttacker: 'character1' | 'character2' = 'character1';
  battleInProgress = false;

  // Propriétés pour gérer les classes d'animation sur chaque personnage
  animationClassCharacter1: string = '';
  animationClassCharacter2: string = '';

  // Coordonnées pour le trou lors du tir de blaster
  holeX: number = 50;
  holeY: number = 50;

  constructor(
    private swapiService: SwapiService,
    private battleService: BattleService,
    private storageService: StorageService
  ) {}

  startBattle(): void {
    this.loading = true;
    this.resetBattleState();

    // Récupération parallèle des deux personnages
    forkJoin([
      this.swapiService.getRandomCharacter(),
      this.swapiService.getRandomCharacter()
    ])
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ([char1, char2]) => {
          this.character1 = char1;
          this.character2 = char2;
          this.battleLog.push(`${char1.name} entre dans l'arène !`);
          this.battleLog.push(`${char2.name} entre dans l'arène !`);
          this.battleInProgress = true;
          // Démarrage du combat après un léger délai pour fluidifier l'UI
          setTimeout(() => this.nextTurn(), 1000);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des personnages', err);
          this.battleLog.push("Erreur lors du chargement des personnages.");
          this.battleInProgress = false;
        }
      });
  }

  private resetBattleState(): void {
    this.character1 = null;
    this.character2 = null;
    this.winner = null;
    this.battleLog = [];
    this.currentAttacker = 'character1';
    this.animationClassCharacter1 = '';
    this.animationClassCharacter2 = '';
  }

  nextTurn(): void {
    if (!this.character1 || !this.character2) return;

    // Vérifier l'état du combat
    const status = this.battleService.checkBattleStatus(this.character1, this.character2);
    if (status.finished) {
      this.winner = status.winner || null;
      this.battleLog.push(`Le combat est terminé ! ${this.winner?.name} remporte la victoire !`);
      this.battleInProgress = false;
      this.saveBattleData();
      return;
    }

    // Déterminer l'attaquant et le défenseur
    let attacker: Character, defender: Character;
    if (this.currentAttacker === 'character1') {
      attacker = this.character1;
      defender = this.character2;
      this.currentAttacker = 'character2';
    } else {
      attacker = this.character2;
      defender = this.character1;
      this.currentAttacker = 'character1';
    }

    // Effectuer l'attaque via le BattleService
    const result = this.battleService.performAttack(attacker, defender);
    this.battleLog.push(result.message);
    if (result.specialEffect) {
      this.battleLog.push(result.specialEffect);
    }
    this.battleLog.push(`${defender.name} a ${defender.health} points de vie restants.`);

    // Déterminer la classe d'animation selon le type d'attaque
    let animClass = '';
    if (result.attackName === 'Sabre Laser' && result.specialEffect?.includes('Brûlure')) {
      animClass = 'burning-animation';
    } else if (result.attackName === 'Force Push') {
      animClass = 'push-animation';
    } else if (result.attackName === 'Tir de Blaster') {
      // Générer des coordonnées aléatoires pour le trou
      this.holeX = Math.floor(Math.random() * 100);
      this.holeY = Math.floor(Math.random() * 100);
      animClass = 'blaster-animation';
    } else {
      animClass = 'attack-animation';
    }

    // Déclencher l'animation sur l'attaquant
    this.triggerAnimation(attacker === this.character1 ? 'character1' : 'character2', animClass);

    // Passage au tour suivant après un délai pour laisser le temps aux animations
    setTimeout(() => this.nextTurn(), 1500);
  }

  private saveBattleData(): void {
    if (!this.winner || !this.character1 || !this.character2) return;

    this.storageService.saveBattleHistory({
      date: new Date(),
      winner: this.winner.name,
      winnerHealth: this.winner.health,
      characters: [
        { name: this.character1.name, powerScore: this.character1.powerScore },
        { name: this.character2.name, powerScore: this.character2.powerScore }
      ],
      log: this.battleLog
    });
    this.storageService.updateRanking(this.winner);
  }

  // Extraction de l'ID du personnage à partir de l'URL
  getCharacterId(url: string): string {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? matches[1] : '0';
  }

  // Gestion de l'erreur de chargement de l'image
  handleImageError(event: any): void {
    event.target.src = 'assets/default-character.jpg';
  }

  // Fonction de trackBy pour améliorer la performance de l'affichage du journal
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Déclenche une animation sur le personnage spécifié
  triggerAnimation(character: 'character1' | 'character2', animClass: string): void {
    if (character === 'character1') {
      this.animationClassCharacter1 = animClass;
      setTimeout(() => this.animationClassCharacter1 = '', 800);
    } else {
      this.animationClassCharacter2 = animClass;
      setTimeout(() => this.animationClassCharacter2 = '', 800);
    }
  }
}

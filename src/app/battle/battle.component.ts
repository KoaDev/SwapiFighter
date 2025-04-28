import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SwapiService } from '../core/services/swapi.service';
import { BattleService } from '../core/services/battle.service';
import {
  BattleHistoryEntry,
  StorageService,
} from '../core/services/storage.service';
import { Character } from '../core/models/character';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
})
export class BattleComponent implements OnInit {
  // Utilisation des signals pour une meilleure réactivité
  character1 = signal<Character | null>(null);
  character2 = signal<Character | null>(null);
  loading = signal(false);
  winner = signal<Character | null>(null);
  battleLog = signal<string[]>([]);
  currentAttacker = signal<'character1' | 'character2'>('character1');
  battleInProgress = signal(false);
  soundEnabled = signal(true);

  // Propriétés pour gérer les classes d'animation sur chaque personnage
  animationClassCharacter1 = signal('');
  animationClassCharacter2 = signal('');

  // Coordonnées pour le trou lors du tir de blaster
  holeX = signal(50);
  holeY = signal(50);

  // Nouvelle propriété pour la vitesse du combat (en ms)
  combatSpeed = signal(1500);

  // Services injectés
  private swapiService = inject(SwapiService);
  private battleService = inject(BattleService);
  private storageService = inject(StorageService);

  // Sons pour le jeu
  private sounds = {
    saber: new Audio('assets/sounds/lightsaber.mp3'),
    blaster: new Audio('assets/sounds/blaster.mp3'),
    force: new Audio('assets/sounds/force.mp3'),
    victory: new Audio('assets/sounds/victory.mp3'),
    defeat: new Audio('assets/sounds/defeat.mp3'),
  };

  ngOnInit(): void {
    // Précharger les sons pour éviter les délais
    Object.values(this.sounds).forEach((sound) => {
      sound.load();
      sound.volume = 0.5;
    });

    // Récupérer les préférences utilisateur sauvegardées
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    const savedSpeed = localStorage.getItem('combatSpeed');
    if (savedSpeed) {
      this.combatSpeed.set(parseInt(savedSpeed, 10));
    }

    const soundSetting = localStorage.getItem('soundEnabled');
    if (soundSetting !== null) {
      this.soundEnabled.set(soundSetting === 'true');
    }
  }

  playSound(soundType: keyof typeof this.sounds): void {
    if (this.soundEnabled()) {
      const sound = this.sounds[soundType];
      sound.pause();
      sound.currentTime = 0;
      sound
        .play()
        .catch((err) => console.log('Erreur de lecture audio :', err));
    }
  }

  startBattle(): void {
    this.loading.set(true);
    this.resetBattleState();

    forkJoin([
      this.swapiService.getRandomCharacter(),
      this.swapiService.getRandomCharacter(),
    ])
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ([char1, char2]) => {
          this.assignCharacterDetails(char1);
          this.assignCharacterDetails(char2);

          this.character1.set(char1);
          this.character2.set(char2);

          const currentLog = [...this.battleLog()];
          currentLog.push(`${char1.name} entre dans l'arène !`);
          currentLog.push(`${char2.name} entre dans l'arène !`);
          this.battleLog.set(currentLog);

          const firstAttacker = this.determineFirstAttacker(char1, char2);
          this.currentAttacker.set(firstAttacker);

          const updatedLog = [...this.battleLog()];
          updatedLog.push(
            `${firstAttacker === 'character1' ? char1.name : char2.name} commence l'attaque !`,
          );
          this.battleLog.set(updatedLog);

          this.battleInProgress.set(true);
          setTimeout(() => this.nextTurn(), 1000);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des personnages', err);
          const errorLog = [...this.battleLog()];
          errorLog.push(
            'Erreur lors du chargement des personnages de la galaxie.',
          );
          this.battleLog.set(errorLog);
          this.battleInProgress.set(false);
        },
      });
  }

  private assignCharacterDetails(character: Character): void {
    const forceSensitiveNames = [
      'Luke Skywalker',
      'Darth Vader',
      'Obi-Wan Kenobi',
      'Yoda',
      'Palpatine',
      'Rey',
      'Kylo Ren',
    ];
    const lightSide = ['Luke Skywalker', 'Obi-Wan Kenobi', 'Yoda', 'Rey'];
    const darkSide = ['Darth Vader', 'Palpatine', 'Kylo Ren'];

    const isForce = forceSensitiveNames.includes(character.name);
    let mainWeapon = 'Blaster';
    if (
      lightSide.includes(character.name) ||
      darkSide.includes(character.name)
    ) {
      mainWeapon = 'Sabre Laser';
    } else if (character.name === 'Chewbacca') {
      mainWeapon = 'Arbalète Wookiee';
    } else if (character.name === 'Boba Fett') {
      mainWeapon = 'Arsenal de Chasseur de Primes';
    }

    character.side = lightSide.includes(character.name)
      ? 'light'
      : darkSide.includes(character.name)
        ? 'dark'
        : null;
    character.mainWeapon = mainWeapon;
    character.forceSensitive = isForce;
  }

  private determineFirstAttacker(
    char1: Character,
    char2: Character,
  ): 'character1' | 'character2' {
    if (char1.forceSensitive && !char2.forceSensitive) {
      return 'character1';
    } else if (!char1.forceSensitive && char2.forceSensitive) {
      return 'character2';
    }

    const agility1 = char1.attributes?.agility || 0;
    const agility2 = char2.attributes?.agility || 0;
    if (agility1 > agility2) {
      return 'character1';
    } else if (agility2 > agility1) {
      return 'character2';
    }

    return Math.random() > 0.5 ? 'character1' : 'character2';
  }

  private resetBattleState(): void {
    this.character1.set(null);
    this.character2.set(null);
    this.winner.set(null);
    this.battleLog.set([]);
    this.currentAttacker.set('character1');
    this.animationClassCharacter1.set('');
    this.animationClassCharacter2.set('');
  }

  nextTurn(): void {
    const char1 = this.character1();
    const char2 = this.character2();
    if (!char1 || !char2 || !this.battleInProgress()) return;

    const status = this.battleService.checkBattleStatus(char1, char2);
    if (status.finished) {
      this.winner.set(status.winner || null);
      const finalLog = [...this.battleLog()];
      finalLog.push(
        `Le combat est terminé ! ${this.winner()?.name} remporte la victoire !`,
      );
      this.battleLog.set(finalLog);
      this.battleInProgress.set(false);
      this.saveBattleData();
      this.playSound('victory');
      return;
    }

    let attacker: Character, defender: Character, isChar1: boolean;
    if (this.currentAttacker() === 'character1') {
      attacker = char1;
      defender = char2;
      isChar1 = true;
      this.currentAttacker.set('character2');
    } else {
      attacker = char2;
      defender = char1;
      isChar1 = false;
      this.currentAttacker.set('character1');
    }

    const result = this.battleService.performAttack(attacker, defender);
    const turnLog = [...this.battleLog()];
    turnLog.push(result.message);
    if (result.specialEffect) {
      turnLog.push(result.specialEffect);
    }
    turnLog.push(
      `${defender.name} a ${defender.health} points de vie restants.`,
    );
    this.battleLog.set(turnLog);

    let animClass: string;
    let soundType: keyof typeof this.sounds;
    if (result.attackName === 'Sabre Laser') {
      animClass = result.specialEffect?.includes('Brûlure')
        ? 'burning-animation'
        : 'attack-animation';
      soundType = 'saber';
    } else if (result.attackName?.includes('Force')) {
      animClass = 'push-animation';
      soundType = 'force';
    } else {
      this.holeX.set(Math.floor(Math.random() * 80 + 10));
      this.holeY.set(Math.floor(Math.random() * 80 + 10));
      animClass = 'blaster-animation';
      soundType = 'blaster';
    }

    this.playSound(soundType);
    this.triggerAnimation(isChar1 ? 'character1' : 'character2', animClass);

    // Scroll automatique du log
    setTimeout(() => {
      const logEl = document.querySelector('.battle-log');
      if (logEl) logEl.scrollTop = logEl.scrollHeight;
    }, 100);

    setTimeout(() => this.nextTurn(), this.combatSpeed());
  }

  private saveBattleData(): void {
    const winnerChar = this.winner();
    const char1 = this.character1();
    const char2 = this.character2();
    if (!winnerChar || !char1 || !char2) return;

    const battleData: BattleHistoryEntry = {
      date: new Date(),
      winner: winnerChar.name,
      winnerHealth: winnerChar.health!,
      winnerSide: winnerChar.side || 'neutral',
      characters: [
        {
          name: char1.name,
          powerScore: char1.powerScore!, // assertion non-null
          side: char1.side || 'neutral',
          weapon: char1.mainWeapon!, // assertion non-null
        },
        {
          name: char2.name,
          powerScore: char2.powerScore!,
          side: char2.side || 'neutral',
          weapon: char2.mainWeapon!,
        },
      ],
      log: this.battleLog(),
      duration: this.battleLog().length,
    };

    this.storageService.saveBattleHistory(battleData);
    this.storageService.updateRanking(winnerChar);
  }

  getCharacterId(url: string): string {
    const match = url.match(/\/(\d+)\/$/);
    return match ? match[1] : '0';
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const char1 = this.character1();
    const char2 = this.character2();
    const character = img.alt === char1?.name ? char1 : char2;
    if (character?.side === 'light') {
      img.src = 'assets/img/light-side-default.jpg';
    } else if (character?.side === 'dark') {
      img.src = 'assets/img/dark-side-default.jpg';
    } else {
      img.src = 'assets/img/default-character.jpg';
    }
  }
  triggerAnimation(
    character: 'character1' | 'character2',
    animClass: string,
  ): void {
    if (character === 'character1') {
      this.animationClassCharacter1.set(animClass);
      setTimeout(() => this.animationClassCharacter1.set(''), 800);
    } else {
      this.animationClassCharacter2.set(animClass);
      setTimeout(() => this.animationClassCharacter2.set(''), 800);
    }
  }
  toggleSound(): void {
    this.soundEnabled.update((v) => !v);
    localStorage.setItem('soundEnabled', this.soundEnabled().toString());
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.log(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  }

  closeWinnerModal(): void {
    this.winner.set(null);
  }
}

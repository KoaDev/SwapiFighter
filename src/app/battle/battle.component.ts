import { Component, inject, OnInit, signal } from '@angular/core';
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
    defeat: new Audio('assets/sounds/defeat.mp3')
  };

  ngOnInit(): void {
    // Précharger les sons pour éviter les délais
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5;
    });

    // Récupérer les préférences utilisateur sauvegardées
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    const savedSpeed = localStorage.getItem('combatSpeed');
    if (savedSpeed) {
      this.combatSpeed.set(parseInt(savedSpeed));
    }

    const soundSetting = localStorage.getItem('soundEnabled');
    if (soundSetting !== null) {
      this.soundEnabled.set(soundSetting === 'true');
    }
  }

  playSound(soundType: keyof typeof this.sounds): void {
    if (this.soundEnabled()) {
      // Arrêter et réinitialiser le son avant de le jouer pour éviter les problèmes
      const sound = this.sounds[soundType];
      sound.pause();
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Erreur de lecture audio:', err));
    }
  }

  startBattle(): void {
    this.loading.set(true);
    this.resetBattleState();

    // Récupération parallèle des deux personnages
    forkJoin([
      this.swapiService.getRandomCharacter(),
      this.swapiService.getRandomCharacter()
    ])
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ([char1, char2]) => {
          // Attribuer un côté de la Force et une arme principale à chaque personnage
          this.assignCharacterDetails(char1);
          this.assignCharacterDetails(char2);

          this.character1.set(char1);
          this.character2.set(char2);

          const currentLog = [...this.battleLog()];
          currentLog.push(`${char1.name} entre dans l'arène !`);
          currentLog.push(`${char2.name} entre dans l'arène !`);
          this.battleLog.set(currentLog);

          // Logique pour déterminer qui commence
          const firstAttacker = this.determineFirstAttacker(char1, char2);
          this.currentAttacker.set(firstAttacker);

          const updatedLog = [...this.battleLog()];
          updatedLog.push(`${firstAttacker === 'character1' ? char1.name : char2.name} commence l'attaque !`);
          this.battleLog.set(updatedLog);

          // Démarrage du combat
          this.battleInProgress.set(true);
          setTimeout(() => this.nextTurn(), 1000);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des personnages', err);
          const errorLog = [...this.battleLog()];
          errorLog.push("Erreur lors du chargement des personnages de la galaxie.");
          this.battleLog.set(errorLog);
          this.battleInProgress.set(false);
        }
      });
  }

  private assignCharacterDetails(character: Character): void {
    // Déterminer le côté de la Force
    const forceSensitive = ['Luke Skywalker', 'Darth Vader', 'Obi-Wan Kenobi', 'Yoda', 'Palpatine', 'Rey', 'Kylo Ren'].includes(character.name);

    // Personnages du côté lumineux
    const lightSide = ['Luke Skywalker', 'Obi-Wan Kenobi', 'Yoda', 'Rey'];

    // Personnages du côté obscur
    const darkSide = ['Darth Vader', 'Palpatine', 'Kylo Ren'];

    // Déterminer l'arme principale
    let mainWeapon = 'Blaster';
    if (lightSide.includes(character.name) || darkSide.includes(character.name)) {
      mainWeapon = 'Sabre Laser';
    } else if (character.name === 'Chewbacca') {
      mainWeapon = 'Arbalète Wookiee';
    } else if (character.name === 'Boba Fett') {
      mainWeapon = 'Arsenal de Chasseur de Primes';
    }

    // Assigner les détails
    character.side = lightSide.includes(character.name) ? 'light' :
      darkSide.includes(character.name) ? 'dark' : null;
    character.mainWeapon = mainWeapon;
    character.forceSensitive = forceSensitive;
  }

  private determineFirstAttacker(char1: Character, char2: Character): 'character1' | 'character2' {
    // Les utilisateurs de la Force ont plus de chances de commencer
    if (char1.forceSensitive && !char2.forceSensitive) {
      return 'character1';
    } else if (!char1.forceSensitive && char2.forceSensitive) {
      return 'character2';
    }

    // Si les deux sont/ne sont pas utilisateurs de la Force, utiliser l'agilité
    if ((char1.attributes?.agility || 0) > (char2.attributes?.agility || 0)) {
      return 'character1';
    } else if ((char1.attributes?.agility || 0) < (char2.attributes?.agility || 0)) {
      return 'character2';
    }

    // En cas d'égalité, choix aléatoire
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

    // Vérifier l'état du combat
    const status = this.battleService.checkBattleStatus(char1, char2);
    if (status.finished) {
      this.winner.set(status.winner || null);

      const finalLog = [...this.battleLog()];
      finalLog.push(`Le combat est terminé ! ${this.winner()?.name} remporte la victoire !`);
      this.battleLog.set(finalLog);

      this.battleInProgress.set(false);
      this.saveBattleData();

      // Jouer le son de victoire et animer le vainqueur
      this.playSound('victory');
      return;
    }

    // Déterminer l'attaquant et le défenseur
    let attacker: Character, defender: Character;
    let attackerIsChar1: boolean;

    if (this.currentAttacker() === 'character1') {
      attacker = char1;
      defender = char2;
      attackerIsChar1 = true;
      this.currentAttacker.set('character2');
    } else {
      attacker = char2;
      defender = char1;
      attackerIsChar1 = false;
      this.currentAttacker.set('character1');
    }

    // Effectuer l'attaque via le BattleService
    const result = this.battleService.performAttack(attacker, defender);

    const turnLog = [...this.battleLog()];
    turnLog.push(result.message);

    if (result.specialEffect) {
      turnLog.push(result.specialEffect);
    }

    turnLog.push(`${defender.name} a ${defender.health} points de vie restants.`);
    this.battleLog.set(turnLog);

    // Déterminer la classe d'animation et le son selon le type d'attaque
    let animClass = 'attack-animation';
    let soundToPlay: keyof typeof this.sounds = 'blaster';

    if (result.attackName === 'Sabre Laser') {
      animClass = result.specialEffect?.includes('Brûlure') ? 'burning-animation' : 'attack-animation';
      soundToPlay = 'saber';
    } else if (result.attackName === 'Force Push' || result.attackName?.includes('Force')) {
      animClass = 'push-animation';
      soundToPlay = 'force';
    } else if (result.attackName === 'Tir de Blaster' || !result.attackName?.includes('Force')) {
      // Générer des coordonnées aléatoires pour le trou
      this.holeX.set(Math.floor(Math.random() * 80 + 10)); // Éviter les bords
      this.holeY.set(Math.floor(Math.random() * 80 + 10));
      animClass = 'blaster-animation';
      soundToPlay = 'blaster';
    }

    // Jouer le son correspondant
    this.playSound(soundToPlay);

    // Déclencher l'animation sur le personnage approprié
    this.triggerAnimation(attackerIsChar1 ? 'character1' : 'character2', animClass);

    // Mettre à jour automatiquement la vue du log
    setTimeout(() => {
      const logElement = document.querySelector('.battle-log');
      if (logElement) {
        logElement.scrollTop = logElement.scrollHeight;
      }
    }, 100);

    // Passage au tour suivant après un délai pour laisser le temps aux animations
    setTimeout(() => this.nextTurn(), this.combatSpeed());
  }

  private saveBattleData(): void {
    const winnerChar = this.winner();
    const char1 = this.character1();
    const char2 = this.character2();

    if (!winnerChar || !char1 || !char2) return;

    const battleData = {
      date: new Date(),
      winner: winnerChar.name,
      winnerHealth: winnerChar.health,
      winnerSide: winnerChar.side || 'neutral',
      characters: [
        {
          name: char1.name,
          powerScore: char1.powerScore,
          side: char1.side || 'neutral',
          weapon: char1.mainWeapon
        },
        {
          name: char2.name,
          powerScore: char2.powerScore,
          side: char2.side || 'neutral',
          weapon: char2.mainWeapon
        }
      ],
      log: this.battleLog(),
      duration: this.battleLog().length // Approximation de la durée du combat
    };

    this.storageService.saveBattleHistory(battleData);
    this.storageService.updateRanking(winnerChar);
  }

  // Extraction de l'ID du personnage à partir de l'URL
  getCharacterId(url: string): string {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? matches[1] : '0';
  }

  // Gestion de l'erreur de chargement de l'image
  handleImageError(event: any): void {
    // Utiliser l'image par défaut correspondant au côté de la Force si possible
    const char1 = this.character1();
    const char2 = this.character2();
    const character = event.target.alt === char1?.name ? char1 : char2;

    if (character?.side === 'light') {
      event.target.src = 'assets/img/light-side-default.jpg';
    } else if (character?.side === 'dark') {
      event.target.src = 'assets/img/dark-side-default.jpg';
    } else {
      event.target.src = 'assets/img/default-character.jpg';
    }
  }

  // Fonction de trackBy pour améliorer la performance de l'affichage du journal
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Déclenche une animation sur le personnage spécifié
  triggerAnimation(character: 'character1' | 'character2', animClass: string): void {
    if (character === 'character1') {
      this.animationClassCharacter1.set(animClass);
      setTimeout(() => this.animationClassCharacter1.set(''), 800);
    } else {
      this.animationClassCharacter2.set(animClass);
      setTimeout(() => this.animationClassCharacter2.set(''), 800);
    }
  }

  // Pour gérer la vitesse du combat
  setCombatSpeed(speed: string): void {
    this.combatSpeed.set(parseInt(speed));
    localStorage.setItem('combatSpeed', speed);
  }

  // Pour activer/désactiver le son
  toggleSound(): void {
    this.soundEnabled.update(value => !value);
    localStorage.setItem('soundEnabled', this.soundEnabled().toString());
  }

  // Pour le mode plein écran
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {});
      }
    }
  }

  closeWinnerModal() {
    this.winner.set(null);
  }
}

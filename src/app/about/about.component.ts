import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleService } from '../core/services/battle.service';

interface DevCharacter {
  name: string;
  role: string;
  skills: string[];
  weaknesses: string[];
  powerLevel: number;
  health: number;
  avatar: string;
  side: 'light' | 'dark';
  catchphrase: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  private battleService = inject(BattleService);

  dev1 = signal<DevCharacter>({
    name: 'Max CHAMPION',
    role: 'Développeur Frontend',
    skills: ['Angular', 'Animation CSS', 'UX/UI'],
    weaknesses: ['Café trop fort', 'Documentation'],
    powerLevel: 95,
    health: 100,
    avatar: 'assets/img/dev/max.jpeg',
    side: 'light',
    catchphrase: 'May the code be with you!'
  });

  dev2 = signal<DevCharacter>({
    name: 'Fabio FAYET',
    role: 'Développeur Backend',
    skills: ['Node.js', 'API Design', 'Optimisation'],
    weaknesses: ['Syntax errors', 'Heures tardives'],
    powerLevel: 92,
    health: 100,
    avatar: 'assets/img/dev/fabio.jpeg',
    side: 'dark',
    catchphrase: 'I find your lack of tests disturbing!'
  });

  battleLog = signal<string[]>([]);
  currentAttacker = signal<'dev1' | 'dev2'>('dev1');
  animationClassDev1 = signal('');
  animationClassDev2 = signal('');
  battleInProgress = signal(false);
  winner = signal<DevCharacter | null>(null);
  loading = signal(false);
  combatSpeed = signal(1500);

  startBattle(): void {
    this.loading.set(true);
    this.resetBattleState();

    // Simulation du chargement des personnages
    setTimeout(() => {
      const currentLog = [...this.battleLog()];
      currentLog.push(`${this.dev1().name} entre dans l'arène !`);
      currentLog.push(`${this.dev2().name} entre dans l'arène !`);
      this.battleLog.set(currentLog);

      // Déterminer qui commence
      const firstAttacker = this.determineFirstAttacker();
      this.currentAttacker.set(firstAttacker);

      const updatedLog = [...this.battleLog()];
      updatedLog.push(
        `${firstAttacker === 'dev1' ? this.dev1().name : this.dev2().name} commence l'attaque !`
      );
      this.battleLog.set(updatedLog);

      // Démarrer le combat
      this.battleInProgress.set(true);
      this.loading.set(false);
      setTimeout(() => this.nextTurn(), 1000);
    }, 1000);
  }

  private determineFirstAttacker(): 'dev1' | 'dev2' {
    // Le dev avec le plus haut powerLevel commence
    return this.dev1().powerLevel >= this.dev2().powerLevel ? 'dev1' : 'dev2';
  }

  private resetBattleState(): void {
    this.battleLog.set([]);
    this.currentAttacker.set('dev1');
    this.animationClassDev1.set('');
    this.animationClassDev2.set('');
    this.winner.set(null);
    this.battleInProgress.set(false);

    // Réinitialiser les points de vie
    this.dev1().health = 100;
    this.dev2().health = 100;
  }

  nextTurn(): void {
    if (!this.battleInProgress()) return;

    // Vérifier si le combat est terminé
    if (this.dev1().health <= 0 || this.dev2().health <= 0) {
      this.endBattle();
      return;
    }

    const attacker = this.currentAttacker() === 'dev1' ? this.dev1() : this.dev2();
    const defender = this.currentAttacker() === 'dev1' ? this.dev2() : this.dev1();

    // Effectuer l'attaque
    const attack = this.performAttack(attacker, defender);

    // Mettre à jour le journal
    const turnLog = [...this.battleLog()];
    turnLog.push(attack.message);
    if (attack.specialEffect) {
      turnLog.push(attack.specialEffect);
    }
    turnLog.push(`${defender.name} a ${defender.health} points de vie restants.`);
    this.battleLog.set(turnLog);

    // Animation
    if (this.currentAttacker() === 'dev1') {
      this.animationClassDev1.set('attack-animation');
      setTimeout(() => this.animationClassDev1.set(''), 500);
    } else {
      this.animationClassDev2.set('attack-animation');
      setTimeout(() => this.animationClassDev2.set(''), 500);
    }

    // Changer d'attaquant pour le prochain tour
    this.currentAttacker.set(this.currentAttacker() === 'dev1' ? 'dev2' : 'dev1');

    // Passer au tour suivant après un délai
    setTimeout(() => this.nextTurn(), this.combatSpeed());
  }

  private performAttack(
    attacker: DevCharacter,
    defender: DevCharacter
  ): { message: string; specialEffect?: string } {
    // Types d'attaques spécifiques aux devs
    const attacks = [
      { name: 'Push de code', damage: 15, effect: 'merge conflict' },
      { name: 'Revue de code', damage: 20, effect: 'commentaires sarcastiques' },
      { name: 'Refactoring', damage: 25, effect: 'code illisible' },
      { name: 'Déploiement nocturne', damage: 30, effect: 'site en maintenance' }
    ];

    const selectedAttack = attacks[Math.floor(Math.random() * attacks.length)];
    const damage = Math.floor(selectedAttack.damage * (attacker.powerLevel / 100));
    defender.health -= damage;

    // Utilisation de const au lieu de let
    const message = `${attacker.name} utilise ${selectedAttack.name}! et inflige ${damage} dégâts!`;

    return {
      message,
      specialEffect: selectedAttack.effect ? `→ ${selectedAttack.effect}` : undefined
    };
  }


  private endBattle(): void {
    this.battleInProgress.set(false);
    const winner = this.dev1().health > 0 ? this.dev1() : this.dev2();
    this.winner.set(winner);

    const finalLog = [...this.battleLog()];
    finalLog.push(`Le combat est terminé ! ${winner.name} remporte la victoire !`);
    this.battleLog.set(finalLog);
  }

  restartBattle(): void {
    this.startBattle();
  }

  closeWinnerModal(): void {
    this.winner.set(null);
  }
}

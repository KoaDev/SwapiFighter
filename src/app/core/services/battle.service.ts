import { Injectable } from '@angular/core';
import { Attack } from '../models/attack';
import { Character } from '../models/character';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private attacks: Attack[] = [
    {
      name: "Sabre Laser",
      damage: 30,
      description: "Une attaque rapide au sabre laser",
      specialEffect: (target: Character) => {
        // 20% de chance de brûlure
        if (Math.random() < 0.2) {
          target.health! -= 5;
          return "Brûlure! 5 dégâts supplémentaires";
        }
        return "";
      }
    },
    {
      name: "Force Push",
      damage: 25,
      description: "Repousse l'adversaire avec la Force",
      specialEffect: (target: Character) => {
        // Réduit l'agilité pour le prochain tour
        target.attributes!.agility -= 5;
        return "Agilité réduite de 5 points";
      }
    },
    {
      name: "Tir de Blaster",
      damage: 20,
      description: "Tir précis avec un blaster"
    }
  ];

  /**
   * Récupère une attaque aléatoire parmi celles définies.
   */
  getRandomAttack(): Attack {
    const idx = Math.floor(Math.random() * this.attacks.length);
    return this.attacks[idx];
  }

  /**
   * Exécute une attaque d’un personnage sur un autre.
   * Calcule dégâts, critiques et effets spéciaux.
   */
  performAttack(
    attacker: Character,
    defender: Character
  ): {
    damage: number;
    message: string;
    specialEffect?: string;
    attackName: string;
  } {
    const attack = this.getRandomAttack();
    const attackName = attack.name;
    const baseDamage = Math.floor(attack.damage * (attacker.powerScore! / 100));
    const criticalHit = Math.random() < 0.1; // 10% de chance de coup critique
    const damage = criticalHit ? baseDamage * 2 : baseDamage;

    let message = `${attacker.name} utilise ${attack.name}`;
    if (criticalHit) {
      message += " (COUP CRITIQUE!)";
    }
    message += ` et inflige ${damage} dégâts!`;

    // Appliquer les dégâts
    defender.health! -= damage;

    // Effet spécial éventuel
    let specialEffectMessage: string | undefined;
    if (attack.specialEffect) {
      const effect = attack.specialEffect(defender);
      if (effect) {
        specialEffectMessage = ` → ${effect}`;
      }
    }

    return { damage, message, specialEffect: specialEffectMessage, attackName };
  }

  /**
   * Vérifie si l’un des personnages est à 0 PV ou moins,
   * et retourne le statut du combat.
   */
  checkBattleStatus(
    character1: Character,
    character2: Character
  ): { finished: boolean; winner?: Character } {
    if (character1.health! <= 0) {
      return { finished: true, winner: character2 };
    }
    if (character2.health! <= 0) {
      return { finished: true, winner: character1 };
    }
    return { finished: false };
  }
}

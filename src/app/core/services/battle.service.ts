// src/app/core/services/battle.service.ts
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

  constructor() { }

  getRandomAttack(): Attack {
    return this.attacks[Math.floor(Math.random() * this.attacks.length)];
  }

  performAttack(attacker: Character, defender: Character): { damage: number; message: string; specialEffect?: string; attackName: string } {
    const attack = this.getRandomAttack();
    const attackName = attack.name;
    const baseDamage = Math.floor(attack.damage * (attacker.powerScore! / 100));
    const criticalHit = Math.random() < 0.1; // 10% de chance de coup critique
    const damage = criticalHit ? baseDamage * 2 : baseDamage;

    let message = `${attacker.name} utilise ${attack.name}`;
    message += criticalHit ? " (COUP CRITIQUE!)" : "";
    message += ` et inflige ${damage} dégâts!`;

    let specialEffectMessage = "";

    // Appliquer les dégâts
    defender.health! -= damage;

    // Effet spécial
    if (attack.specialEffect) {
      const effect = attack.specialEffect(defender);
      if (effect) {
        specialEffectMessage = ` → ${effect}`;
      }
    }

    return { damage, message, specialEffect: specialEffectMessage, attackName };
  }

  checkBattleStatus(character1: Character, character2: Character): { finished: boolean; winner?: Character } {
    if (character1.health! <= 0) {
      return { finished: true, winner: character2 };
    }
    if (character2.health! <= 0) {
      return { finished: true, winner: character1 };
    }
    return { finished: false };
  }
}

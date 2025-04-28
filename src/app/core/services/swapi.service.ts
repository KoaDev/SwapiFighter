import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Character } from '../models/character';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private apiUrl = 'http://52.58.110.120/api';
  private http = inject(HttpClient);

  getRandomCharacter(): Observable<Character> {
    const randomId = Math.floor(Math.random() * 82) + 1;
    return this.http
      .get<Character>(`${this.apiUrl}/people/${randomId}/`)
      .pipe(map((character) => this.enrichCharacterData(character)));
  }

  private enrichCharacterData(character: Character): Character {
    // Calcul des attributs de base
    const mass = character.mass === 'unknown' ? 50 : parseInt(character.mass);
    const height =
      character.height === 'unknown' ? 150 : parseInt(character.height);

    // Calcul des attributs avancés
    const attributes = {
      strength: Math.floor(mass * 0.7 + Math.random() * 30),
      agility: Math.floor((200 - height) * 0.5 + Math.random() * 20),
      intelligence: Math.floor(Math.random() * 100),
    };

    // Bonus équipement
    const equipmentBonus =
      character.starships.length * 15 + character.vehicles.length * 10;

    // Bonus Force
    const forceBonus = this.isForceSensitive(character.name) ? 50 : 0;

    // Score final
    const powerScore = Math.round(
      attributes.strength * 0.4 +
        attributes.agility * 0.3 +
        attributes.intelligence * 0.2 +
        equipmentBonus +
        forceBonus,
    );

    return {
      ...character,
      attributes,
      powerScore,
      health: 100, // Points de vie initiaux
    };
  }

  private isForceSensitive(name: string): boolean {
    const forceUsers = [
      'Skywalker',
      'Vader',
      'Yoda',
      'Palpatine',
      'Maul',
      'Dooku',
    ];
    return forceUsers.some((user) => name.includes(user));
  }
}

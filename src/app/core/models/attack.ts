import { Character } from './character';

export interface Attack {
  name: string;
  damage: number;
  description: string;
  specialEffect?: (target: Character) => string;
}

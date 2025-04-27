export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  starships: string[];
  vehicles: string[];
  url: string;
  side?: 'light' | 'dark' | null;
  mainWeapon?: string;
  forceSensitive?: boolean;
  powerScore?: number;
  health: number;
  attributes?: { strength: number; agility: number; intelligence: number; };
}

export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  starships: string[];
  vehicles: string[];
  url: string;
  powerScore?: number;
  health?: number;
  attributes?: {
    strength: number;
    agility: number;
    intelligence: number;
  };
}

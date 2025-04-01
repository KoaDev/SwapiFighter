export interface Attack {
  name: string;
  damage: number;
  description: string;
  specialEffect?: (arg : any) => string;
}

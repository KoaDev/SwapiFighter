export interface UniverseItem {
  type: 'character' | 'planet' | 'starship' | 'vehicle' | 'species';
  name: string;
  url: string;
  film: string;
  metadata: Record<string, unknown>;
}

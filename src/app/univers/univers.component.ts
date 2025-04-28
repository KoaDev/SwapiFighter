import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Film } from '../core/models/film';
import { UniverseItem } from '../core/models/universe-item';
import { UniverseService } from '../core/services/universe.service';

@Component({
  selector: 'app-univers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './univers.component.html',
  styleUrls: ['./univers.component.css']
})
export class UniversComponent implements OnInit {
  universeData: { film: Film; items: UniverseItem[] }[] = [];
  filteredData: { film: Film; items: UniverseItem[] }[] = [];
  loading = true;
  selectedCategory: 'all' | 'characters' | 'planets' | 'starships' = 'all';

  constructor(private universeService: UniverseService) {}

  ngOnInit(): void {
    this.loadUniverseData();
  }

  loadUniverseData(): void {
    this.universeService.getUniverseByFilms().subscribe({
      next: (data) => {
        this.universeData = data;
        this.applyFilter(); // Applique le filtre initial
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading universe data', err);
        this.loading = false;
      }
    });
  }

  filterByCategory(category: 'all' | 'characters' | 'planets' | 'starships'): void {
    this.selectedCategory = category;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedCategory === 'all') {
      this.filteredData = this.universeData.map(group => ({
        film: group.film,
        items: [...group.items] // Copie des items
      }));
      return;
    }

    // Détermine le type correspondant à la catégorie
    const typeMap: Record<'characters' | 'planets' | 'starships', UniverseItem['type']> = {
      characters: 'character',
      planets:     'planet',
      starships:   'starship'
    };
    const targetType = typeMap[this.selectedCategory];

    this.filteredData = this.universeData.map(group => ({
      film: group.film,
      items: group.items.filter(item => item.type === targetType)
    }));
  }

  /** Retourne le libellé français d’un type d’item */
  getDisplayType(type: UniverseItem['type']): string {
    const typeNames: Record<UniverseItem['type'], string> = {
      character: 'Personnage',
      planet:    'Planète',
      starship:  'Vaisseau',
      vehicle:   'Véhicule',
      species:   'Espèce'
    };
    return typeNames[type] || type;
  }
}

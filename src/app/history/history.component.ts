import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StorageService,
  BattleHistoryEntry,
  RankingEntry,
} from '../core/services/storage.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {
  battleHistory: BattleHistoryEntry[] = [];
  ranking: RankingEntry[] = [];

  constructor(private storageService: StorageService) {
    this.loadData();
  }

  loadData(): void {
    // Récupère l'historique de combats typé
    this.battleHistory = this.storageService.getBattleHistory();
    // Récupère le classement et le trie par nombre de victoires
    this.ranking = this.storageService
      .getRanking()
      .sort((a, b) => b.wins - a.wins);
  }

  clearHistory(): void {
    this.storageService.clearAllData();
    this.loadData();
  }
}

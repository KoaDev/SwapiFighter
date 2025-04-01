import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../core/services/storage.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  battleHistory: any[] = [];
  ranking: any[] = [];

  constructor(private storageService: StorageService) {
    this.loadData();
  }

  loadData(): void {
    this.battleHistory = this.storageService.getBattleHistory();
    this.ranking = this.storageService.getRanking()
      .sort((a, b) => b.wins - a.wins);
  }

  clearHistory(): void {
    this.storageService.clearAllData();
    this.loadData();
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  saveBattleHistory(battleData: any): void {
    const history = this.getBattleHistory();
    history.push(battleData);
    localStorage.setItem('battleHistory', JSON.stringify(history));
  }

  getBattleHistory(): any[] {
    return JSON.parse(localStorage.getItem('battleHistory') || '[]');
  }

  updateRanking(winner: any): void {
    const ranking = this.getRanking();
    const existingChar = ranking.find((c: any) => c.name === winner.name);

    if (existingChar) {
      existingChar.wins++;
      existingChar.lastWin = new Date();
    } else {
      ranking.push({
        name: winner.name,
        wins: 1,
        lastWin: new Date(),
        powerScore: winner.powerScore
      });
    }

    localStorage.setItem('ranking', JSON.stringify(ranking));
  }

  getRanking(): any[] {
    return JSON.parse(localStorage.getItem('ranking') || '[]');
  }

  clearAllData(): void {
    localStorage.removeItem('battleHistory');
    localStorage.removeItem('ranking');
  }
}

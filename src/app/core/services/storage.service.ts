// src/app/core/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Character } from '../models/character';

/**
 * Version "raw" des données de l'historique, telles que
 * JSON-parses depuis localStorage (date stockée en ISO string).
 */
export interface RawBattleHistoryEntry {
  date: string;
  winner: string;
  winnerHealth: number;
  winnerSide: string;
  characters: {
    name: string;
    powerScore: number;
    side: string;
    weapon: string;
  }[];
  log: string[];
  duration: number;
}

/**
 * Version "raw" du ranking, avec lastWin en ISO string.
 */
export interface RawRankingEntry {
  name: string;
  wins: number;
  lastWin: string;
  powerScore: number;
}

/**
 * BattleHistoryEntry utilisable dans l'app, date en Date.
 */
export interface BattleHistoryEntry {
  date: Date;
  winner: string;
  winnerHealth: number;
  winnerSide: string;
  characters: {
    name: string;
    powerScore: number;
    side: string;
    weapon: string;
  }[];
  log: string[];
  duration: number;
}

/**
 * Entrée du classement avec lastWin en Date.
 */
export interface RankingEntry {
  name: string;
  wins: number;
  lastWin: Date;
  powerScore: number;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Sauvegarde un nouvel historique de combat.
   * Convertit la date en ISO string pour JSON.
   */
  saveBattleHistory(battleData: BattleHistoryEntry): void {
    const history = this.getBattleHistory();
    history.push(battleData);
    const raw: RawBattleHistoryEntry[] = history.map((entry) => ({
      ...entry,
      date: entry.date.toISOString(),
    }));
    localStorage.setItem('battleHistory', JSON.stringify(raw));
  }

  /**
   * Récupère la liste des combats, en reconvertissant
   * la date ISO string en Date.
   */
  getBattleHistory(): BattleHistoryEntry[] {
    const raw = localStorage.getItem('battleHistory') || '[]';
    const parsed = JSON.parse(raw) as RawBattleHistoryEntry[];
    return parsed.map((entry) => ({
      ...entry,
      date: new Date(entry.date),
    }));
  }

  /**
   * Met à jour le classement en ajoutant une victoire au gagnant.
   * Convertit lastWin en ISO string pour JSON.
   */
  updateRanking(winner: Character): void {
    const ranking = this.getRanking();
    const existing = ranking.find((r) => r.name === winner.name);

    if (existing) {
      existing.wins++;
      existing.lastWin = new Date();
    } else {
      ranking.push({
        name: winner.name,
        wins: 1,
        lastWin: new Date(),
        powerScore: winner.powerScore!,
      });
    }

    const raw: RawRankingEntry[] = ranking.map((r) => ({
      ...r,
      lastWin: r.lastWin.toISOString(),
    }));
    localStorage.setItem('ranking', JSON.stringify(raw));
  }

  /**
   * Récupère le classement, en reconvertissant
   * lastWin ISO string en Date.
   */
  getRanking(): RankingEntry[] {
    const raw = localStorage.getItem('ranking') || '[]';
    const parsed = JSON.parse(raw) as RawRankingEntry[];
    return parsed.map((entry) => ({
      ...entry,
      lastWin: new Date(entry.lastWin),
    }));
  }

  /**
   * Supprime tous les historiques et classements.
   */
  clearAllData(): void {
    localStorage.removeItem('battleHistory');
    localStorage.removeItem('ranking');
  }
}

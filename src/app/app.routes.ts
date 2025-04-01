import { Routes } from '@angular/router';
import { BattleComponent } from './battle/battle.component';
import {HistoryComponent} from './history/history.component';

export const routes: Routes = [
  { path: '', component: BattleComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '' }
];

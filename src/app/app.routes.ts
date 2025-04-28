import { Routes } from '@angular/router';
import { BattleComponent } from './battle/battle.component';
import {HistoryComponent} from './history/history.component';
import {AboutComponent} from './about/about.component';
import {UniversComponent} from './univers/univers.component';

export const routes: Routes = [
  { path: '', component: BattleComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'about', component: AboutComponent },
  { path: 'universe', component: UniversComponent },
  { path: '**', redirectTo: '' }
];

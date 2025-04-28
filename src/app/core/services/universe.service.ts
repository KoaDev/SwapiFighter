// universe.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, forkJoin, map, switchMap} from 'rxjs';
import { Film } from '../models/film';
import { UniverseItem } from '../models/universe-item';
import { Character } from '../models/character';
import {SwapiService} from './swapi.service';
import {Starship} from '../models/starship';
import {Planet} from '../models/planet';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private apiUrl = 'http://52.58.110.120/api';
  private http = inject(HttpClient);
  private swapiService = inject(SwapiService);

  getFilms(): Observable<Film[]> {
    return this.http.get<{ results: Film[] }>(`${this.apiUrl}/films/`).pipe(
      map(response => response.results.sort((a, b) => a.episode_id - b.episode_id))
    );
  }

  getUniverseByFilms(): Observable<{film: Film, items: UniverseItem[]}[]> {
    return this.getFilms().pipe(
      switchMap(films => {
        const filmRequests = films.map(film => {
          const allUrls = [
            ...film.characters.map(url => ({ url, type: 'character' as const })),
            ...film.planets.map(url => ({ url, type: 'planet' as const })),
            ...film.starships.map(url => ({ url, type: 'starship' as const }))
          ];

          const itemRequests = allUrls.map(({url, type}) => {
            switch (type) {
              case 'character':
                return this.http.get<Character>(url).pipe(
                  map(data => ({
                    type,
                    name: data.name,
                    url,
                    film: film.title,
                    metadata: data
                  }))
                );
              case 'planet':
                return this.http.get<Planet>(url).pipe(
                  map(data => ({
                    type,
                    name: data.name,
                    url,
                    film: film.title,
                    metadata: data
                  }))
                );
              case 'starship':
                return this.http.get<Starship>(url).pipe(
                  map(data => ({
                    type,
                    name: data.name,
                    url,
                    film: film.title,
                    metadata: data
                  }))
                );
              default:
                throw new Error(`Unknown type: ${type}`);
            }
          });

          return forkJoin(itemRequests).pipe(
            map(items => ({ film, items }))
          );
        });

        return forkJoin(filmRequests);
      })
    );
  }

  getItemDetails(url: string): Observable<any> {
    return this.http.get(url);
  }
}

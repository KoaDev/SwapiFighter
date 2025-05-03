# 🌟 Star Wars Battle - Angular Application

## 🚀 Overview

A web application built with **Angular** that simulates detailed battles between Star Wars characters.  
Each character is defined by a set of attributes: **strength**, **agility**, **intelligence**, and a specific **weapon**.  
During the battle, all actions are displayed step by step, allowing the user to follow everything that happens in real time — from attacks to special effects and final outcome.

Key features:

- Real-time battle simulation between characters with detailed stats.
- Battle history tracking with results.
- Information about the app and its creators.
- Star Wars universe exploration.

---

## 🛠️ Technical Stack

- **Framework**: Angular 17+ (Standalone Components)
- **Routing**: Client-side navigation with `@angular/router`.
- **HTTP**: Data fetching via `HttpClient` (Observables/RxJS).
- **Services**: Logic separation (`BattleService`, `SwapiService`).
- **TypeScript**: Strong typing with interfaces (`Character`, `Attack`).

---

## 📂 Project Structure

```plaintext
src/
├── app/
│   ├── about/                # About page component
│   ├── battle/               # Battle simulation component
│   ├── core/
│   │   ├── models/           # TypeScript interfaces (Attack, Character)
│   │   └── services/         # Angular services (Battle, SWAPI)
│   ├── history/              # Battle history component
│   ├── navigation/           # Navigation menu
│   ├── univers/              # All univers (Character, Planets, Vaisseaux)
│   ├── app.component.ts      # Root component
│   ├── app.routes.ts         # Route definitions
│   └── app.config.ts         # App configuration (HTTP, Router)
```

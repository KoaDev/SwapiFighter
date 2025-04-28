# 🌟 Star Wars Battle - Angular Application

## 🚀 Overview
A web application built with **Angular** that simulates battles between Star Wars characters.  
Key features:
- Battle simulation between characters.
- History tracking of past battles.
- Information about the app and its creators.

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
│   ├── app.component.ts      # Root component
│   ├── app.routes.ts         # Route definitions
│   └── app.config.ts         # App configuration (HTTP, Router)

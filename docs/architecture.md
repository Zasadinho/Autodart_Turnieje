# Architektura

Ten dokument wyjaśnia architekturę na wysokim poziomie.
Pełna mapa folderów i plików, wraz z powiązaniami build/runtime, znajduje się w [codebase-map.md](codebase-map.md).

## Przegląd
Asystent jest podzielony na warstwy domenowe i nadal dostarczany jako pojedynczy userscript (`dist/autodarts-turnieje-asystent.user.js`).

- `src/core`: stałe, stan, utilsy, zdarzenia, logowanie
- `src/domain`: reguły turniejowe, czysta logika meczów/KO/tabel/czasu
- `src/data`: I/O storage, normalizacja, migracja
- `src/bracket`: niskopoziomowy payload bracketu, template iframe i transport frame
- `src/app`: orkiestracja między domeną, persystencją, bracketem i UI
- `src/infra`: API‑client, automatyzacja API, autodetekcja DOM, import historii, hooki tras
- `src/ui`: rendering, helpery widoków, handler, style
- `src/runtime`: tylko pliki bootstrap/wiring

## Docelowy DAG
- `core -> (none)`
- `domain -> core`
- `data -> core, domain`
- `bracket -> core, domain`
- `app -> core, data, domain, bracket`
- `infra -> core, app`
- `ui -> core, app`
- `runtime -> core, app, infra, ui`

## Build i dystrybucja
- Build działa bez npm/Node, przez `scripts/build.ps1`.
- Kolejność jest deterministyczna dzięki `build/manifest.json`.
- Źródło wersji znajduje się w `build/version.json` i jest wstrzykiwane do nagłówka oraz `APP_VERSION`.
- CSS z `src/ui/styles/main.css` jest osadzany w bundlu podczas builda.
- Wynik to nadal pojedynczy plik w `dist/` (kompatybilny z loaderem).
- `dist/*` pozostaje artefaktem generowanym i nie jest edytowany ręcznie.

## Runtime
- Strażnik runtime: `window.__ATA_RUNTIME_BOOTSTRAPPED`
- Publiczne API: `window.__ATA_RUNTIME`
  - `openDrawer`, `closeDrawer`, `toggleDrawer`, `isReady`, `version`
  - `runSelfTests()` do lokalnej diagnostyki
- `src/runtime/bootstrap.js` uruchamia cały proces.
- `src/app/public-api.js` publikuje API runtime.
- `src/app/browser-lifecycle.js`, `src/infra/dom-autodetect.js` i `src/infra/history-import.js` zawierają właściwą logikę przeglądarkową/DOM.

## Model danych
- Storage‑key: `ata:tournament:v1`
- `schemaVersion: 4`
- Nowy obiekt reguł na turniej:
  - `tournament.rules.tieBreakProfile: "promoter_h2h_minitable" | "promoter_points_legdiff"`
- Nowe globalne pole ustawień:
  - `settings.tournamentTimeProfile: "fast" | "normal" | "slow"`
- Logika presetów turniejowych:
  - `ui.createDraft.x01Preset` przechowuje aktywny preset tworzenia
  - Domyślny: `pdc_european_tour_official`
  - Legacy `pdc_standard` normalizowany do `pdc_501_double_out_basic`
- KO:
  - `settings.featureFlags.koDrawLockDefault: boolean`
  - `tournament.ko.drawLocked: boolean`
  - `tournament.ko.placement: number[]`

## Prognoza czasu
- Szczegóły formuły i kalibracji znajdują się w `docs/tournament-duration.md`.
- Prognoza czasu turnieju żyje jako czysta logika domenowa w `src/domain/tournament-duration.js`.
- Podstawa szacowania:
  - tryb i liczba uczestników
  - oczekiwane legi na mecz z `Best of`
  - konfiguracja X01 (`Startscore`, `In`, `Out`, `Bull-off`, `Tryb bulla`, `Max Rund`)
  - globalny profil czasu (`fast | normal | slow`)
- UI renderuje z tego blok na żywo w formularzu turnieju.
- `src/ui/handlers.js` aktualizuje ten blok przy każdym wejściu w formularzu, bez pełnego re-renderu shell.

## Model reguł (DRA/PDC)
- Standard: `promoter_h2h_minitable` (również przy migracji danych).
- Kolejność tie-break (Round Robin):
  1. Punkty (2 wygrana, 1 remis, 0 porażka)
  2. Przy 2 równych punktowo: bezpośredni pojedynek
  3. Przy 3+ równych: różnica legów w podgrupie
  4. Różnica legów ogólna
  5. Wygrane legi ogółem
  6. Jeśli nadal remis: `playoff_required`
- Przejście grup → KO jest blokowane, dopóki `playoff_required` jest aktywne.

## Logika KO
- KO pozostaje `Pojedyncza eliminacja`.
- Tryby losowania:
  - `seeded`
  - `open_draw`
- Pełna materializacja meczów we wszystkich rundach:
  - otwarte późniejsze rundy są prowadzone jako nieedytowalne sloty
  - byes są zapisywane jako jawne mecze Bye
- Draw‑Lock:
  - domyślnie początkowy KO‑draw pozostaje stabilny (`drawLocked = true`)
  - można go przełączyć dla aktywnego turnieju KO

## Jakość i testy
- `scripts/qa.ps1`: orkiestracja QA
- `scripts/qa-architecture.ps1`: reguły warstw i zakazane efekty uboczne
- `scripts/qa-encoding.ps1`: UTF‑8/umlauty/mojibake
- `scripts/qa-regelcheck.ps1`: mapowanie reguł → kod
- `scripts/test-domain.ps1`: izolowany domain‑harness bez npm i bez mock‑DOM
- `scripts/test-runtime-contract.ps1`: kontrakt Runtime‑API i selftest przeciwko `dist/*`
- `scripts/qa-build-discipline.ps1`: źródło wersji i generowane `dist/*`
- Selftest runtime: `window.__ATA_RUNTIME.runSelfTests()`
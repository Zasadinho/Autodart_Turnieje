// Auto-generated module split from dist source.
  function renderSettingsTab() {
    const debugEnabled = state.store.settings.debug ? "checked" : "";
    const tournamentTimeProfile = sanitizeTournamentTimeProfile(
      state.store.settings.tournamentTimeProfile,
      TOURNAMENT_TIME_PROFILE_NORMAL,
    );
    const tournamentTimeProfileOptions = TOURNAMENT_TIME_PROFILES.map((profileId) => {
      const profileMeta = getTournamentTimeProfileMeta(profileId);
      const selectedAttr = tournamentTimeProfile === profileId ? "selected" : "";
      const label = profileId === TOURNAMENT_TIME_PROFILE_NORMAL
        ? `${profileMeta.label} (empfohlen)`
        : profileMeta.label;
      return `<option value="${profileMeta.id}" ${selectedAttr}>${escapeHtml(label)}</option>`;
    }).join("");
    const autoLobbyEnabled = state.store.settings.featureFlags.autoLobbyStart ? "checked" : "";
    const randomizeKoEnabled = state.store.settings.featureFlags.randomizeKoRound1 ? "checked" : "";
    const koDrawLockDefaultEnabled = state.store.settings.featureFlags.koDrawLockDefault !== false ? "checked" : "";
    const activeKoDrawLocked = state.store?.tournament?.mode === "ko"
      ? (state.store?.tournament?.ko?.drawLocked !== false ? "checked" : "")
      : "";
    const activeKoDrawLockDisabledAttr = state.store?.tournament?.mode === "ko" ? "" : "disabled";
    const modeLimitSummary = buildModeParticipantLimitSummary();
    const tieBreakProfile = normalizeTieBreakProfile(
      state.store?.tournament?.rules?.tieBreakProfile,
      TIE_BREAK_PROFILE_PROMOTER_H2H_MINITABLE,
    );
    const tieBreakDisabledAttr = state.store?.tournament ? "" : "disabled";
    const apiSyncHelpLinks = renderInfoLinks([
      { href: README_API_AUTOMATION_URL, kind: "tech", label: "Otwórz wyjaśnienie półautomatyki API", title: "README: API półautomatyka" },
      { href: README_INFO_SYMBOLS_URL, kind: "tech", label: "Pokaż legendę ikon informacyjnych", title: "README: Info-Symbole" },
    ]);
    const koDrawHelpLinks = renderInfoLinks([
      { href: README_TOURNAMENT_MODES_URL, kind: "tech", label: "Otwórz wyjaśnienie trybów turniejowych", title: "README: Tryby turniejowe und Open Draw" },
      { href: DRA_GUI_RULE_OPEN_DRAW_URL, kind: "rule", label: "Otwórz wyjaśnienie zasad DRA dotyczących Open Draw", title: "Zasady DRA w GUI: Open Draw" },
    ]);
    const koDrawLockHelpLinks = renderInfoLinks([
      { href: DRA_GUI_RULE_DRAW_LOCK_URL, kind: "rule", label: "Otwórz wyjaśnienie zasad DRA dotyczących Draw‑Lock", title: "Zasady DRA w GUI: Draw Lock" },
    ]);

    return `
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Debugowanie i flagi funkcji", [
          { href: README_SETTINGS_URL, kind: "tech", label: "Otwórz dokumentację ustawień", title: "README: Ustawienia" },
          { href: README_INFO_SYMBOLS_URL, kind: "tech", label: "Pokaż legendę ikon informacyjnych", title: "README: Info-Symbole" },
        ])}
        <div class="ata-toggle">
          <div>
            <strong>Debug-Mode</strong>
            <div class="ata-small">Aktywuje szczegółowe logi w konsoli przeglądarki.</div>
          </div>
          <input type="checkbox" id="ata-setting-debug" data-action="toggle-debug" ${debugEnabled}>
        </div>
        <div class="ata-toggle">
          <div>
            <strong>Automatyczny start lobby + synchronizacja API ${apiSyncHelpLinks}</strong>
            <div class="ata-small">Domyślnie: WYŁ. Włącza uruchamianie meczu jednym kliknięciem oraz automatyczne pobieranie wyników z API Autodarts.</div>
          </div>
          <input type="checkbox" id="ata-setting-autolobby" data-action="toggle-autolobby" ${autoLobbyEnabled}>
        </div>
        <div class="ata-toggle">
          <div>
            <strong>Losowo wymieszaj pierwszą rundę KO (Standard) ${koDrawHelpLinks}</strong>
            <div class="ata-small">Domyślnie: WŁ. Nowe turnieje KO korzystają z Open Draw (losowa kolejność, wolne losy zgodne z zasadami PDC).</div>
          </div>
          <input type="checkbox" id="ata-setting-randomize-ko" data-action="toggle-randomize-ko" ${randomizeKoEnabled}>
        </div>
        <div class="ata-toggle">
          <div>
            <strong>Zablokuj drabinkę KO (domyślnie) ${koDrawLockHelpLinks}</strong>
            <div class="ata-small">Domyślnie: WŁ. Początkowe losowanie w turniejach KO pozostaje bez zmian.</div>
          </div>
          <input type="checkbox" id="ata-setting-ko-draw-lock-default" data-action="toggle-ko-draw-lock-default" ${koDrawLockDefaultEnabled}>
        </div>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Prognoza czasu trwania turnieju", [
          { href: README_TOURNAMENT_CREATE_URL, kind: "tech", label: "Otwórz objaśnienie prognozy czasu turnieju", title: "README: Utwórz turniej" },
          { href: README_SETTINGS_URL, kind: "tech", label: "Otwórz dokumentację ustawień", title: "README: Ustawienia" },
        ])}
        <div class="ata-field">
          <label for="ata-setting-tournament-time-profile">Zeitprofil</label>
          <select id="ata-setting-tournament-time-profile" data-action="set-tournament-time-profile">
            ${tournamentTimeProfileOptions}
          </select>
        </div>
        <p class="ata-small">Prognoza w zakładce <code>Turniej</code> zawsze bazuje na: startowym wyniku, formacie Best of, ustawieniach In/Out, bull‑off, trybie bulla oraz globalnym profilu czasowym.</p>
        <p class="ata-small"><strong>Szybki:</strong> Sprawny przebieg. <strong>Normal:</strong>Standardowe tempo. <strong>Wolne:</strong> bardziej zachowawczy dla mieszanych grup i dłuższych czasów zmian.</p>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Blokada losowania KO (aktywny turniej)", [
          { href: DRA_GUI_RULE_DRAW_LOCK_URL, kind: "rule", label: "Otwórz wyjaśnienie zasad DRA dotyczących Draw‑Lock", title: "Zasady DRA w GUI: Draw Lock" },
        ])}
        <div class="ata-toggle">
          <div>
            <strong>Nie zmieniaj początkowego losowania</strong>
            <div class="ata-small">Gdy opcja jest aktywna, struktura KO tego turnieju pozostaje niezmieniona i nie jest automatycznie losowana ponownie.</div>
          </div>
          <input type="checkbox" id="ata-setting-ko-draw-locked" data-action="set-ko-draw-locked" ${activeKoDrawLocked} ${activeKoDrawLockDisabledAttr}>
        </div>
        <p class="ata-small">Dostępne tylko w trybie KO (Straight Knockout).</p>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Profil Tie-Break promotora", [
          { href: DRA_GUI_RULE_TIE_BREAK_URL, kind: "rule", label: "Otwórz wyjaśnienie zasad DRA dotyczących Tie-Breaka", title: "Zasady DRA w GUI: tie-break" },
        ])}
        <div class="ata-field">
          <label for="ata-setting-tiebreak">Profil turniejowy</label>
          <select id="ata-setting-tiebreak" data-action="set-tiebreak-mode" ${tieBreakDisabledAttr}>
            <option value="${TIE_BREAK_PROFILE_PROMOTER_H2H_MINITABLE}" ${tieBreakProfile === TIE_BREAK_PROFILE_PROMOTER_H2H_MINITABLE ? "selected" : ""}>Promotor: H2H + min-tabela (zalecane)</option>
            <option value="${TIE_BREAK_PROFILE_PROMOTER_POINTS_LEGDIFF}" ${tieBreakProfile === TIE_BREAK_PROFILE_PROMOTER_POINTS_LEGDIFF ? "selected" : ""}>Promotor: punkty + różnica legów</option>
          </select>
        </div>
        <p class="ata-small"><strong>Promoter H2H + Mini-Tabelle:</strong> Punkte (2/1/0), danach Direktvergleich (2er-Gleichstand), Teilgruppen-Leg-Differenz (3+), Gesamt-Leg-Differenz, Legs gewonnen; verbleibender Gleichstand = &bdquo;Playoff erforderlich&ldquo;.</p>
        <p class="ata-small"><strong>Promotor: punkty + różnica legów:</strong> vereinfachte Sortierung \u00fcber Punkte, Gesamt-Leg-Differenz und Legs gewonnen (legacy-kompatibel).</p>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Lista kontrolna DRA (nie do zautomatyzowania)", [
          { href: DRA_GUI_RULE_CHECKLIST_URL, kind: "rule", label: "Otwórz objaśnienie zasad DRA dotyczących listy kontrolnej", title: "Zasady DRA w interfejsie: lista kontrolna" },
        ])}
        <ul class="ata-small">
		  <li>Kolejność startu/rzutów oraz decyzje bull off są potwierdzane przez sędziego na miejscu.</li>
		  <li>Czas na rozgrzewkę/rozpoczęcie oraz zasady zachowania przy tarczy są egzekwowane organizacyjnie.</li>
		  <li>Decyzje Tie-Break przy utrzymującym się remisie są podejmowane przez promotora.</li>
		  <li>Niejasne przypadki szczególne są dokumentowane i rozstrzygane ręcznie przed kontynuacją turnieju.</li>
        </ul>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Podstawa zasad i limity", [
          { href: DRA_GUI_RULE_PARTICIPANT_LIMITS_URL, kind: "rule", label: "Otwórz objaśnienie zasad DRA dotyczących limitów", title: "Zasady DRA w interfejsie: limity uczestników" },
        ])}
        <p class="ata-small">Aktywne limity trybu: ${escapeHtml(modeLimitSummary)}.</p>
        <p class="ata-small">Zasady DRA nie określają stałego globalnego maksimum uczestników. Powyższe limity zostały celowo ustalone dla zapewnienia uczciwego czasu trwania turnieju i stabilnego wyświetlania.</p>
      </section>
      <section class="ata-card tournamentCard">
        ${renderSectionHeading("Storage", [
          { href: README_BASE_URL, kind: "tech", label: "Otwórz wskazówki dotyczące Storage i importu", title: "README: import, migracja i trwałość danych" },
        ])}
        <p class="ata-small"><code>${escapeHtml(STORAGE_KEY)}</code>, schemaVersion ${STORAGE_SCHEMA_VERSION}</p>
      </section>
    `;
  }

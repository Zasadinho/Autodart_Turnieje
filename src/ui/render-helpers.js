// Presentation layer: UI rendering and interaction wiring.

  function renderInfoLinks(links) {
    if (!Array.isArray(links) || !links.length) {
      return "";
    }

    const linksHtml = links
      .map((entry) => {
        const href = String(entry?.href || "").trim();
        if (!href) {
          return "";
        }
        const kind = normalizeToken(entry?.kind || "tech");
        const isRuleLink = kind === "rule" || kind === "rules" || kind === "regel";
        const symbol = isRuleLink ? "§" : "ⓘ";
        const className = isRuleLink
          ? "ata-help-link ata-help-link-rule"
          : "ata-help-link ata-help-link-tech";
        const label = normalizeText(entry?.label) || "Mehr Informationen";
        const title = normalizeText(entry?.title) || label;
        return `
          <a
            class="${className}"
            href="${escapeHtml(href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeHtml(label)}"
            title="${escapeHtml(title)}"
          >${symbol}</a>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!linksHtml) {
      return "";
    }

    return `<span class="ata-help-links">${linksHtml}</span>`;
  }


  function renderSectionHeading(title, links = []) {
    return `
      <div class="ata-heading-row">
        <h3>${escapeHtml(title)}</h3>
        ${renderInfoLinks(links)}
      </div>
    `;
  }


  function formatDurationMinutes(value) {
    const totalMinutes = Math.max(0, Math.round(Number(value) || 0));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) {
      return `${minutes}m`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }


  function formatDurationDecimal(value, digits = 1) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return `0,${"0".repeat(Math.max(0, digits))}`;
    }
    return numeric.toFixed(digits).replace(".", ",");
  }


  function renderTournamentDurationEstimate(estimate) {
    const helpLinks = renderInfoLinks([
      { href: README_TOURNAMENT_CREATE_URL, kind: "tech", label: "Otwórz objaśnienie prognozy czasu turnieju", title: "README: Utwórz turniej" },
      { href: README_SETTINGS_URL, kind: "tech", label: "Otwórz ustawienia profilu czasowego", title: "README: Einstellungen" },
    ]);
    const estimateReason = normalizeText(estimate?.reason || "");

    if (!estimate?.ready) {
      return `
        <section class="ata-estimate-card ata-estimate-card-pending">
          <div class="ata-estimate-head">
            <strong>Przewidywany czas trwania turnieju</strong>
            ${helpLinks}
          </div>
          <div class="ata-estimate-value ata-estimate-value-pending">Noch nicht berechenbar</div>
          <p class="ata-small">${escapeHtml(estimateReason || "„Szacowanie rozpocznie się, gdy konfiguracja dla wybranego trybu będzie prawidłowa.")}</p>
          <p class="ata-small">Annahme: Single-Board-Flow auf einem Board.</p>
        </section>
      `;
    }

    const setupSummary = `${estimate.x01.baseScore}, ${estimate.x01.inMode} In, ${estimate.x01.outMode} Out, Bull-off ${estimate.x01.bullOffMode}, Best of ${estimate.bestOfLegs}`;

    return `
      <section class="ata-estimate-card">
        <div class="ata-estimate-head">
          <strong>Przewidywany czas trwania turnieju</strong>
          ${helpLinks}
        </div>
        <div class="ata-estimate-value">ok. ${escapeHtml(formatDurationMinutes(estimate.likelyMinutes))}</div>
        <div class="ata-estimate-meta">
          <span>Uczestników: ${escapeHtml(String(estimate.participantCount))}</span>
          <span>Meczy: ${escapeHtml(String(estimate.matchCount))}</span>
          <span>Średnia ${escapeHtml(formatDurationDecimal(estimate.matchMinutes))} min/Mecz</span>
          <span>Profil ${escapeHtml(estimate.profile.label)}</span>
        </div>
        <div class="ata-estimate-range">
          Realistycznie: ${escapeHtml(formatDurationMinutes(estimate.lowMinutes))} - ${escapeHtml(formatDurationMinutes(estimate.highMinutes))}
        </div>
        <p class="ata-small">${escapeHtml(estimate.profile.description)}</p>
        <p class="ata-small">Basis: ${escapeHtml(setupSummary)}.</p>
      </section>
    `;
  }

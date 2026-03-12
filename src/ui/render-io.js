// Auto-generated module split from dist source.
  function renderIOTab() {
    return `
      <section class="ata-card tournamentCard">
        <h3>Export</h3>
        <div class="ata-actions">
          <button type="button" class="ata-btn ata-btn-primary" data-action="export-file">Pobierz JSON</button>
          <button type="button" class="ata-btn" data-action="export-clipboard">Kopiuj JSON do schowka</button>
        </div>
      </section>
      <section class="ata-card tournamentCard">
        <h3>Import</h3>
        <div class="ata-field">
          <label for="ata-import-file">Importuj plik</label>
          <input id="ata-import-file" type="file" accept=".json,application/json">
        </div>
        <div class="ata-field" style="margin-top: 10px;">
          <label for="ata-import-text">Wklej JSON</label>
          <textarea id="ata-import-text" placeholder="{ ... }"></textarea>
        </div>
        <div class="ata-actions" style="margin-top: 10px;">
          <button type="button" class="ata-btn" data-action="import-text">Importuj wklejony JSON</button>
        </div>
      </section>
    `;
  }



// Auto-generated module split from dist source.
  async function init() {
    await loadPersistedStore();
    state.runtimeStatusSignature = runtimeStatusSignature();
    ensureHost();
    renderShell();
    removeMatchReturnShortcut();
    renderHistoryImportButton();

    initEventBridge();
    installRouteHooks();
    startAutoDetectionObserver();
    setupRuntimeApi();
    addInterval(() => {
      syncPendingApiMatches().catch((error) => {
        logWarn("api", "Błąd podczas synchronizacji w tle.", error);
      });
    }, API_SYNC_INTERVAL_MS);
    addInterval(() => {
      refreshRuntimeStatusUi();
      renderHistoryImportButton();
    }, 1200);

    state.ready = true;
    window.dispatchEvent(new CustomEvent(READY_EVENT, {
      detail: {
        version: APP_VERSION,
      },
    }));
    logDebug("runtime", "Środowisko wykonawcze ATA zostało zainicjalizowane.");
  }

  init().catch((error) => {
    logError("runtime", "Inicjalizacja nie powiodła się.", error);
  });
})();



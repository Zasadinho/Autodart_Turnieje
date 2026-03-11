// Auto-generated module split from dist source.
  function getOpenMatchByPlayers(tournament, player1Id, player2Id) {
    const key = new Set([player1Id, player2Id]);
    const candidates = tournament.matches.filter((match) => {
      if (match.status !== STATUS_PENDING) {
        return false;
      }
      if (!match.player1Id || !match.player2Id) {
        return false;
      }
      const set = new Set([match.player1Id, match.player2Id]);
      return key.size === set.size && [...key].every((id) => set.has(id));
    });
    return candidates.length === 1 ? candidates[0] : null;
  }


  function deriveWinnerIdFromLegInput(match, p1Legs, p2Legs, legsToWin) {
    if (!match?.player1Id || !match?.player2Id) {
      return null;
    }
    if (p1Legs === p2Legs) {
      return null;
    }
    if (p1Legs > legsToWin || p2Legs > legsToWin) {
      return null;
    }
    if (p1Legs === legsToWin && p1Legs > p2Legs) {
      return match.player1Id;
    }
    if (p2Legs === legsToWin && p2Legs > p1Legs) {
      return match.player2Id;
    }
    return null;
  }


  function applyMatchResultToTournament(tournament, matchId, winnerId, legs, source, stats = null) {
    if (!tournament) {
      return { ok: false, message: "Brak aktywnego turnieju." };
    }

    const match = findMatch(tournament, matchId);
    if (!match) {
      return { ok: false, message: "Nie znaleziono meczu." };
    }
    if (!match.player1Id || !match.player2Id) {
      return { ok: false, message: "Mecz nie ma jeszcze dwóch uczestników." };
    }
    if (winnerId && winnerId !== match.player1Id && winnerId !== match.player2Id) {
      return { ok: false, message: "Zwycięzca nie pasuje do tego meczu." };
    }

    const legsToWin = getLegsToWin(tournament.bestOfLegs);
    const p1Legs = clampInt(legs?.p1, 0, 0, 99);
    const p2Legs = clampInt(legs?.p2, 0, 0, 99);
    const derivedWinnerId = deriveWinnerIdFromLegInput(match, p1Legs, p2Legs, legsToWin);

    if (p1Legs > legsToWin || p2Legs > legsToWin) {
      return {
        ok: false,
        message: `Nieprawidłowy wynik: na zawodnika przypada maksymalnie ${legsToWin} legów. (Best-of ${sanitizeBestOf(tournament.bestOfLegs)}).`,
      };
    }

    if (p1Legs === p2Legs) {
      return { ok: false, message: "Nieprawidłowy wynik: w systemie Best‑of remis nie jest możliwy." };
    }

    if (!derivedWinnerId) {
      return {
        ok: false,
        message: `Nieprawidłowy wynik: zawodnik musi zdobyć dokładnie ${legsToWin} legów. (Best-of ${sanitizeBestOf(tournament.bestOfLegs)}).`,
      };
    }

    if (winnerId && winnerId !== derivedWinnerId) {
      return {
        ok: false,
        message: "Nieprawidłowy wynik: zwycięzca musi wynikać z liczby zdobytych legów.",
      };
    }

    match.status = STATUS_COMPLETED;
    match.winnerId = derivedWinnerId;
    match.source = source === "auto" ? "auto" : "manual";
    match.legs = { p1: p1Legs, p2: p2Legs };
    match.stats = normalizeMatchStats(stats || match.stats);
    setMatchResultKind(match, null);
    const now = nowIso();
    const auto = ensureMatchAutoMeta(match);
    if (source === "auto") {
      auto.status = "completed";
      auto.finishedAt = now;
      auto.lastSyncAt = now;
      auto.lastError = null;
    } else if (auto.lobbyId || auto.status === "started" || auto.status === "error") {
      auto.status = "completed";
      auto.finishedAt = now;
      auto.lastSyncAt = now;
      auto.lastError = null;
    }
    match.updatedAt = now;
    return { ok: true };
  }


  function getKoBlockingSourceMatch(tournament, match) {
    if (!tournament || !match || match.stage !== MATCH_STAGE_KO || match.round <= 1) {
      return null;
    }

    const previousRound = match.round - 1;
    const sourceNumberA = ((match.number - 1) * 2) + 1;
    const sourceNumberB = sourceNumberA + 1;
    const sourceMatches = getMatchesByStage(tournament, MATCH_STAGE_KO)
      .filter((item) => (
        item.round === previousRound
        && (item.number === sourceNumberA || item.number === sourceNumberB)
      ))
      .sort((left, right) => left.number - right.number);

    if (!sourceMatches.length) {
      return null;
    }

    return sourceMatches.find((item) => item.status !== STATUS_COMPLETED) || null;
  }


  function getMatchEditability(tournament, match) {
    if (!tournament || !match) {
      return { editable: false, reason: "Mecz niedostępny." };
    }

    if (match.status === STATUS_COMPLETED) {
      return { editable: false, reason: "Mecz został już zakończony." };
    }

    if (!match.player1Id || !match.player2Id) {
      return { editable: false, reason: "Pojedynek nie jest jeszcze ustalony." };
    }

    if (match.stage === MATCH_STAGE_KO) {
      const blockingMatch = getKoBlockingSourceMatch(tournament, match);
      if (blockingMatch) {
        return {
          editable: false,
          reason: `Poprzedni mecz: runda ${blockingMatch.round} / gra ${blockingMatch.number} musi zostać najpierw zakończony.`,
        };
      }
    }

    return { editable: true, reason: "" };
  }



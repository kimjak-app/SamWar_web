import {
  SEASON_LABELS,
  SEASON_ORDER,
  SEASON_TURNS,
  START_YEAR,
  YEAR_TURNS,
} from "../constants.js";

function normalizeTurn(turn) {
  return Number.isInteger(turn) && turn > 0 ? turn : 1;
}

export function formatCalendarLabel(calendar) {
  if (!calendar) {
    return "";
  }

  return `${calendar.year}년 ${calendar.seasonLabel} ${calendar.seasonTurn}턴`;
}

export function deriveCalendarFromTurn(turn) {
  const normalizedTurn = normalizeTurn(turn);
  const zeroBasedTurn = normalizedTurn - 1;
  const year = START_YEAR + Math.floor(zeroBasedTurn / YEAR_TURNS);
  const yearTurn = (zeroBasedTurn % YEAR_TURNS) + 1;
  const seasonIndex = Math.floor((zeroBasedTurn % YEAR_TURNS) / SEASON_TURNS);
  const seasonTurn = (zeroBasedTurn % SEASON_TURNS) + 1;
  const season = SEASON_ORDER[seasonIndex] ?? SEASON_ORDER[0];
  const seasonLabel = SEASON_LABELS[season] ?? season;
  const calendar = {
    year,
    yearTurn,
    season,
    seasonLabel,
    seasonTurn,
  };

  return {
    ...calendar,
    displayLabel: formatCalendarLabel(calendar),
  };
}

export function createInitialCalendar() {
  return deriveCalendarFromTurn(1);
}

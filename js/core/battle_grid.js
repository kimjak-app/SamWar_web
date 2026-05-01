export const BATTLE_GRID_WIDTH = 10;
export const BATTLE_GRID_HEIGHT = 6;

export function isSamePosition(a, b) {
  return a?.x === b?.x && a?.y === b?.y;
}

export function isInBounds(position) {
  return (
    Number.isInteger(position?.x)
    && Number.isInteger(position?.y)
    && position.x >= 0
    && position.x < BATTLE_GRID_WIDTH
    && position.y >= 0
    && position.y < BATTLE_GRID_HEIGHT
  );
}

export function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getUnitAt(units, position) {
  return units.find((unit) => unit.isAlive && isSamePosition(unit, position)) ?? null;
}

export function getWalkablePositions(unit, units, grid = { width: BATTLE_GRID_WIDTH, height: BATTLE_GRID_HEIGHT }) {
  if (!unit?.isAlive) {
    return [];
  }

  const positions = [];

  for (let x = 0; x < grid.width; x += 1) {
    for (let y = 0; y < grid.height; y += 1) {
      const candidate = { x, y };

      if (isSamePosition(candidate, unit)) {
        continue;
      }

      if (!isInBounds(candidate) || getDistance(unit, candidate) > unit.moveRange) {
        continue;
      }

      if (getUnitAt(units, candidate)) {
        continue;
      }

      positions.push(candidate);
    }
  }

  return positions;
}

export function getAttackableUnits(unit, units) {
  if (!unit?.isAlive) {
    return [];
  }

  return units.filter((otherUnit) => (
    otherUnit.isAlive
    && otherUnit.side !== unit.side
    && getDistance(unit, otherUnit) <= unit.attackRange
  ));
}

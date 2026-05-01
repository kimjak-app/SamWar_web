import { isInBounds } from "./battle_grid.js";

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function getDirectionFromDelta(delta) {
  if (!delta || (delta.x === 0 && delta.y === 0)) {
    return null;
  }

  if (Math.abs(delta.x) >= Math.abs(delta.y)) {
    return delta.x >= 0 ? "right" : "left";
  }

  return delta.y >= 0 ? "down" : "up";
}

export function getDirectionFromPositions(from, to) {
  if (!from || !to) {
    return null;
  }

  return getDirectionFromDelta({
    x: to.x - from.x,
    y: to.y - from.y,
  });
}

export function getOppositeDirection(direction) {
  if (direction === "up") {
    return "down";
  }

  if (direction === "down") {
    return "up";
  }

  if (direction === "left") {
    return "right";
  }

  if (direction === "right") {
    return "left";
  }

  return null;
}

export function getAttackAngleType(attacker, defender) {
  const attackDirection = getDirectionFromPositions(defender, attacker);

  if (!attackDirection || !defender?.facing) {
    return "front";
  }

  if (attackDirection === defender.facing) {
    return "front";
  }

  if (attackDirection === getOppositeDirection(defender.facing)) {
    return "back";
  }

  return "side";
}

export function getAttackAngleBonus(angleType) {
  if (angleType === "back") {
    return 1.3;
  }

  if (angleType === "side") {
    return 1.15;
  }

  return 1.0;
}

export function getDirectionLabel(direction) {
  if (direction === "up") {
    return "↑";
  }

  if (direction === "down") {
    return "↓";
  }

  if (direction === "left") {
    return "←";
  }

  if (direction === "right") {
    return "→";
  }

  return "·";
}

export function getFacingOptions(unit) {
  if (!unit) {
    return [];
  }

  return Object.entries(DIRECTIONS)
    .map(([direction, delta]) => ({
      x: unit.x + delta.x,
      y: unit.y + delta.y,
      direction,
    }))
    .filter((position) => isInBounds(position));
}

export const terrainTypes = {
  plain: {
    id: "plain",
    name: "평지",
    passable: true,
    moveCost: 1,
    defenseBonus: 0,
    description: "기본 지형입니다.",
  },
  forest: {
    id: "forest",
    name: "숲",
    passable: true,
    moveCost: 2,
    defenseBonus: 0.1,
    description: "나중에 이동력 저하와 방어 보정에 사용할 지형입니다.",
  },
  mountain: {
    id: "mountain",
    name: "산",
    passable: true,
    moveCost: 3,
    defenseBonus: 0.2,
    description: "나중에 높은 이동 비용과 방어 보정에 사용할 지형입니다.",
  },
  river: {
    id: "river",
    name: "강",
    passable: false,
    moveCost: Infinity,
    defenseBonus: 0,
    description: "나중에 통과 불가 또는 특수 이동 규칙에 사용할 지형입니다.",
  },
  bridge: {
    id: "bridge",
    name: "다리",
    passable: true,
    moveCost: 1,
    defenseBonus: 0,
    description: "강 위 통과 지점으로 사용할 지형입니다.",
  },
  wall: {
    id: "wall",
    name: "성벽",
    passable: false,
    moveCost: Infinity,
    defenseBonus: 0.3,
    description: "나중에 성벽/장애물/공성 규칙에 사용할 지형입니다.",
  },
  coast: {
    id: "coast",
    name: "해안",
    passable: true,
    moveCost: 2,
    defenseBonus: 0,
    description: "나중에 수전/상륙/해안 전장 연결에 사용할 지형입니다.",
  },
};

export function getTerrainType(terrainId) {
  return terrainTypes[terrainId] ?? terrainTypes.plain;
}

export function createPlainTerrainMap(width, height) {
  const safeWidth = Number.isFinite(width) && width > 0 ? Math.floor(width) : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.floor(height) : 1;

  return Array.from({ length: safeHeight }, () =>
    Array.from({ length: safeWidth }, () => "plain"),
  );
}

export function normalizeTerrainMap(terrainMap, width, height) {
  const safeWidth = Number.isFinite(width) && width > 0 ? Math.floor(width) : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.floor(height) : 1;
  const fallbackMap = createPlainTerrainMap(safeWidth, safeHeight);

  if (!Array.isArray(terrainMap)) {
    return fallbackMap;
  }

  return fallbackMap.map((row, y) =>
    row.map((_terrainId, x) => {
      const candidate = terrainMap[y]?.[x];
      return terrainTypes[candidate] ? candidate : "plain";
    }),
  );
}

export function getTerrainAt(battleState, x, y) {
  return getTerrainType(battleState?.terrainMap?.[y]?.[x]);
}

export function isTerrainPassable(battleState, x, y) {
  return getTerrainAt(battleState, x, y).passable;
}

export function getTerrainMoveCost(battleState, x, y) {
  return getTerrainAt(battleState, x, y).moveCost;
}

export function getTerrainDefenseBonus(battleState, x, y) {
  return getTerrainAt(battleState, x, y).defenseBonus;
}

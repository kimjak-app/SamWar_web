export function getFactionById(factions, factionId) {
  return factions.find((faction) => faction.id === factionId) ?? null;
}

export const ENEMY_INVASION_CHANCE = 0.45;

export function isPlayerCity(city) {
  return city?.ownerFactionId === "player";
}

export function isEnemyCity(city) {
  return city?.ownerFactionId === "enemy";
}

export function canAttackCity(cities, targetCity) {
  if (!targetCity || !isEnemyCity(targetCity)) {
    return false;
  }

  return targetCity.neighbors.some((neighborId) => {
    const neighbor = cities.find((city) => city.id === neighborId);
    return isPlayerCity(neighbor);
  });
}

export function getAttackSourceCity(cities, targetCityId) {
  const targetCity = cities.find((city) => city.id === targetCityId);

  if (!targetCity) {
    return null;
  }

  return targetCity.neighbors
    .map((neighborId) => cities.find((city) => city.id === neighborId))
    .find((neighbor) => isPlayerCity(neighbor)) ?? null;
}

export function getEnemyInvasionCandidates(cities) {
  const candidates = [];

  for (const attackerCity of cities) {
    if (!isEnemyCity(attackerCity)) {
      continue;
    }

    for (const neighborId of attackerCity.neighbors) {
      const defenderCity = cities.find((city) => city.id === neighborId);

      if (!isPlayerCity(defenderCity)) {
        continue;
      }

      candidates.push({
        attackerCityId: attackerCity.id,
        defenderCityId: defenderCity.id,
      });
    }
  }

  return candidates;
}

export function rollEnemyInvasion(cities, chance = ENEMY_INVASION_CHANCE, randomValue = Math.random()) {
  const candidates = getEnemyInvasionCandidates(cities);

  if (candidates.length === 0 || randomValue >= chance) {
    return null;
  }

  const selectedIndex = Math.floor(Math.random() * candidates.length);
  return candidates[selectedIndex] ?? null;
}

export function occupyCity(cities, cityId, ownerFactionId = "player") {
  return cities.map((city) =>
    city.id === cityId ? { ...city, ownerFactionId } : city,
  );
}

export function isWorldUnified(cities) {
  return cities.every((city) => isPlayerCity(city));
}

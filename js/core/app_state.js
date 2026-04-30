import { cities } from "../../data/cities.js";
import { factions } from "../../data/factions.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";

export function createInitialAppState() {
  return {
    meta: {
      title: "SamWar Web",
      phase: "HTML MVP scaffold",
      status: "Placeholder title screen",
    },
    world: {
      cities,
      factions,
      heroes,
      skills,
    },
  };
}

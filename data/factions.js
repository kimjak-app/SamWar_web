import { FACTION_IDS } from "../js/constants.js";

export const factions = [
  {
    id: FACTION_IDS.PLAYER,
    name: "한성 세력",
    shortName: "아군",
    color: "#5bb8ff",
    capitalCityId: "hanseong",
    chancellorHeroId: null,
    chancellorPolicy: "balanced",
    isPlayer: true,
  },
  {
    id: FACTION_IDS.LUOYANG,
    name: "낙양 세력",
    shortName: "낙양",
    color: "#ff9f6e",
    capitalCityId: "luoyang",
    chancellorHeroId: "guan_yu",
    chancellorPolicy: "military",
    isPlayer: false,
  },
  {
    id: FACTION_IDS.PYEONGYANG,
    name: "평양 세력",
    shortName: "평양",
    color: "#f0c35a",
    capitalCityId: "pyeongyang",
    chancellorHeroId: "gwanggaeto",
    chancellorPolicy: "balanced",
    isPlayer: false,
  },
  {
    id: FACTION_IDS.KYOTO,
    name: "교토 세력",
    shortName: "교토",
    color: "#ff7b7b",
    capitalCityId: "kyoto",
    chancellorHeroId: "nobunaga",
    chancellorPolicy: "trade",
    isPlayer: false,
  },
];

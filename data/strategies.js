export const strategyOutcomes = {
  shake: {
    id: "shake",
    name: "동요",
    effectType: "shake",
    description: "적의 공격과 방어를 흔듭니다.",
  },
  confusion: {
    id: "confusion",
    name: "혼란",
    effectType: "confusion",
    description: "적의 행동을 방해합니다.",
  },
};

export const strategies = [
  {
    id: "strategy",
    name: "책략",
    target: "enemy",
    effectType: "random_intelligence_tier",
    baseSuccessRate: 0.55,
    description: "지력에 따라 혼란 또는 동요를 유발할 수 있습니다.",
  },
];

const gameSpeed = 2;

export const TIMERS = {
  healthRegenInterval: 20000,  // Health regenerates every 20 seconds
  treasureInterval: 5000 * gameSpeed,      // Treasure found every 5 seconds
  hazardInterval: 1000 * gameSpeed,        // Hazards occur every second
  woodGenerationInterval: 10000,  // Wood generated every 10 seconds
  stoneGenerationInterval: 15000,  // Stone generated every 15 seconds
  timeNeededToCompleteLevel: 6000,
};

export const MONSTER_CONFIG = {
  baseHealth: 50,
  healthMultiplier: 50,  // Increase health with depth
  baseDamage: 5,
  damageMultiplier: 5,  // Increase damage with depth
  monsterAttackIntervalRange: [2000, 5000],  // Monsters attack between 2 and 5 seconds
};

export const RESEARCH_CONFIG = {
  baseResearchDuration: 1800000,  // Research takes 30 minutes
  researchBoostFactor: 1.5,       // Boost to research duration based on intelligence
};

export const CHARACTER_CONFIG = {
baseXp: 200,
xpNeededPerLevelIncrease: 1.4,
};
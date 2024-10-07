export class Building {
  constructor(name, cost, type, effect, description, unlockCondition) {
    this.name = name;
    this.cost = cost;  // Object with various resource costs
    this.type = type;  // 'generator', 'storage', 'feature' (to define the purpose)
    this.effect = effect;  // Effect applied after purchase (e.g., resource max increase)
    this.description = description;  // New description field
    this.unlockCondition = unlockCondition;
  }

  // Check if the player can afford the building
  canAfford(resources) {
    for (const [resource, amount] of Object.entries(this.cost)) {
      if (resources[resource] < amount) {
        return false;
      }
    }
    // console.log('can afford');
    return true;
  }

  isUnlocked(character) {
    return this.unlockCondition(character);
  }

  // Apply the building effect (based on type)
  applyEffect(character) {
    if (this.type === 'generator') {
      // Generate resources over time (handled elsewhere)
    } else if (this.type === 'storage') {
      // Increase max storage
      character.maxWood += this.effect.wood || 0;
      character.maxStone += this.effect.stone || 0;
    } else if (this.type === 'feature') {
      character.libraryBuilt = true; // Set flag when the library is built
    }
  }
}

// Define the array of buildings
export const buildings = [
  new Building(
    'Lumber Mill',
    { coins: 150 },  // Multi-resource cost
    'generator',
    { productionRate: 5 },  // Generates wood per second
    'Generates 1 wood every 10 seconds.',
    function (character) { return true; }
  ),
  new Building(
    'Stone Quarry',
    { wood: 100, coins: 300 },
    'generator',
    { productionRate: 3 },
    'Generates 1 stone every 15 seconds.',
    function (character) { return character.buildings.some(building => building.name === 'Lumber Mill'); }
  ),
  new Building(
    'Wood Warehouse',
    { wood: 100, stone: 50, coins: 300 },
    'storage',
    { wood: 200 },  // Increases max wood/stone storage
    'Increases the maximum storage of wood with 200.',
    function (character) { return character.buildings.some(building => building.name === 'Lumber Mill'); }
  ),
  new Building(
    'Stone Warehouse',
    { wood: 100, stone: 50, coins: 300 },
    'storage',
    { stone: 200 },  // Increases max wood/stone storage
    'Increases the maximum storage of stone with 200.',
    function (character) { return character.buildings.some(building => building.name === 'Stone Quarry'); }
  ),
  new Building(
    'Library',
    { wood: 300, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'research' },  // Unlocks research for upgrades
    'Unlocks the ability to research.',
    function (character) { return character.buildings.some(building => building.name === 'Stone Quarry') && character.intelligence >= 20; }
  ),
  new Building(
    'Alchemy center',
    { wood: 300, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'alchemy' },  // Unlocks research for upgrades
    'Unlocks more consumables.',
    function (character) { return character.buildings.some(building => building.name === 'Library') && character.intelligence >= 20; }
  ),
  new Building(
    'Blacksmith',
    { wood: 500, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'alchemy' },  // Unlocks research for upgrades
    'Unlocks more consumables.',
    function (character) { return character.buildings.some(building => building.name === 'Library') && character.intelligence >= 20; }
  ),
  new Building(
    'Mineral extractor',
    { wood: 500, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'extract' },  // Unlocks research for upgrades
    'Place at a certain depth and it will harvest resources.',
    function (character) { return character.buildings.some(building => building.name === 'Library') && character.intelligence >= 20; }
  ),
];
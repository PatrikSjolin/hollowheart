export class Character {
  constructor(saveToLocalStorage, logMessage, initialState = {}) {
    this.playerName = initialState.playerName || 'Soldier';  // Fix here
    this.level = initialState.level || 1;
    this.strength = initialState.strength || 10;
    this.dexterity = initialState.dexterity || 10;
    this.vitality = initialState.vitality || 10;
    this.intelligence = initialState.intelligence || 10;
    this.health = this.calculateMaxHealth();
    this.currentHealth = initialState.currentHealth || 100;
    this.iron = initialState.iron || 0;
    this.gold = initialState.gold || 0;
    this.diamonds = initialState.diamonds || 0;
    this.coins = initialState.coins || 0;
    this.unallocatedPoints = initialState.unallocatedPoints || 0;
    this.experience = initialState.experience || 0;
    this.depth = initialState.depth || 0;
    this.isExploring = initialState.isExploring || false;
    this.buildings = initialState.buildings || [];
    this.lifeRegen = initialState.lifeRegen || 1; // Add life regeneration stat (1 HP every 20 seconds)
    this.wood = initialState.wood || 0;
    this.stone = initialState.stone || 0;
    this.regenTimer = 0; // Initialize regen timer for health regeneration
    this.treasureTimer = 0;
    this.hazardTimer = 0;
    this.woodTimer = 0;
    this.stoneTimer = 0;
    this.saveToLocalStorage = saveToLocalStorage;
    saveToLocalStorage(this);
    this.logMessage = logMessage;
  }

  // Calculate max health based on vitality (10 HP per point of vitality)
  calculateMaxHealth() {
    return this.vitality * 10;
  }

  // Regenerate health based on lifeRegen stat
  regenerateHealth(elapsedTime) {
    this.regenTimer += elapsedTime;
    const regenInterval = 20000;

    if (this.regenTimer >= regenInterval) {
      if (this.currentHealth < this.health) {
        this.currentHealth = Math.min(this.currentHealth + this.lifeRegen, this.health);
        this.logMessage(`Regenerated ${this.lifeRegen} health. Current health: ${this.currentHealth}`);
        this.saveToLocalStorage(this); // Save state after regeneration
      }
      this.regenTimer = this.regenTimer - regenInterval;
    }

    this.saveToLocalStorage(this);
  }

  // Method to start exploring (descend)
  startExploring() {
    this.isExploring = true;
    this.depth += 1; // Start at depth 1 or go deeper
    this.logMessage(`You descend to depth ${this.depth}`);
  }

  // Method to ascend (stop exploring)
  ascend() {
    if (this.isExploring) {
      this.isExploring = false;
      this.logMessage(`You ascend back to the surface.`);
      this.depth = 0;
      this.saveToLocalStorage(this); // Trigger React state update
    }
  }

  // Exploration mechanism - gathering resources, finding items, gaining experience, and encountering hazards
  explore(elapsedTime) {
    if (this.isExploring) {
      const treasureInterval = 5000;
      this.treasureTimer += elapsedTime;
      if (this.treasureTimer > treasureInterval) {
        // Simulate finding resources and gaining experience
        const resourceFound = {
          iron: Math.floor(Math.random() * 5) * this.depth,
          gold: Math.floor(Math.random() * 3) * this.depth,
          diamonds: Math.floor(Math.random() * 1) * this.depth,
        };
        this.iron += resourceFound.iron;
        this.gold += resourceFound.gold;
        this.diamonds += resourceFound.diamonds;
        this.treasureTimer = this.treasureTimer - treasureInterval;
        this.logMessage(`You found ${resourceFound.iron} iron, ${resourceFound.gold} gold, and ${resourceFound.diamonds} diamonds.`);
      }

      const hazardInterval = 1000;
      this.hazardTimer += elapsedTime;
      if (this.hazardTimer > hazardInterval) {
        // Check for hazards (enemies or environments)
        this.encounterHazard();

        // Check if it's time to level up
        if (this.experience >= Math.floor(200 * Math.pow(1.5, this.level - 1))) {
          this.levelUp();
        }
        this.hazardTimer = this.hazardTimer - hazardInterval;
      }
    }
  }

  // Method to simulate encountering a hazard
  encounterHazard() {
    const hazardChance = Math.random(); // Random chance to encounter a hazard
    const dangerLevel = this.depth * 15; // Increased danger scaling

    if (hazardChance < 0.7) { // Increased chance of a hazard occurring (60%)
      const damage = Math.floor(Math.random() * dangerLevel) + 6; // Hazard deals more damage (min 10)

      const armor = this.strength * 4;
      const damageReduction = (armor / (armor + 120));
      const damageTaken = Math.floor(damage * (1 - damageReduction));

      this.currentHealth -= damageTaken;
      this.logMessage(`You encountered a hazard and took ${damageTaken} damage! Current health: ${this.currentHealth}.`);
      console.log(`actual damage: ${damage}, reduction: ${damageReduction}`);

      const expGained = this.depth * Math.floor(Math.random() * 20) + 5; // Random exp gained
      this.experience += expGained;
      this.logMessage(`You survived and gained ${expGained} experience.`);

      // If health drops to zero or below, the character dies and returns to the surface
      if (this.currentHealth <= 0) {
        this.die();
      }
    }
  }

  // Method for the character to die and reset
  die() {
    this.logMessage("You have died and lost all resources gathered during the journey. Now you need to rest.");
    this.iron = 0;
    this.gold = 0;
    this.diamonds = 0;
    this.currentHealth = 0;
    this.ascend(); // Ascend back to the surface upon death
  }

  // Method for leveling up
  levelUp() {
    this.level += 1;
    this.unallocatedPoints += 5; // Allocate stat points
    this.logMessage(`Level up! You are now level ${this.level} and gained 5 unallocated stat points.`);
    this.saveToLocalStorage(this); // Update React state
  }

  // Method to convert resources to coins
  convertToCoins(resourceType) {
    let conversionRate = 1; // Define conversion rates
    switch (resourceType) {
      case 'iron':
        conversionRate = 1;
        this.coins += this.iron * conversionRate;
        this.logMessage(`Converted ${this.iron} Iron to ${this.iron * conversionRate} Coins.`);
        this.iron = 0;
        break;
      case 'gold':
        conversionRate = 5;
        this.coins += this.gold * conversionRate;
        this.logMessage(`Converted ${this.gold} Gold to ${this.gold * conversionRate} Coins.`);
        this.gold = 0;
        break;
      case 'diamonds':
        conversionRate = 10;
        this.coins += this.diamonds * conversionRate;
        this.logMessage(`Converted ${this.diamonds} Diamonds to ${this.diamonds * conversionRate} Coins.`);
        this.diamonds = 0;
        break;
    }
    this.saveToLocalStorage(this); // Update React state
  }

  upgradeStat(stat) {
    if (this.unallocatedPoints > 0) {
      this[stat] += 1; // Increment the stat
      this.unallocatedPoints -= 1; // Reduce the available points
      if (stat === 'vitality') {
        this.health = this.calculateMaxHealth();
      }
      this.logMessage(`Upgraded ${stat}. Remaining points: ${this.unallocatedPoints}`);
      this.saveToLocalStorage(this);
    } else {
      this.logMessage(`No unallocated points available.`);
    }
  }

  // Method to buy buildings that generate resources
  buyBuilding(building) {
    if (building.canAfford(this)) {
      // Deduct the resources
      for (const [resource, amount] of Object.entries(building.cost)) {
        this[resource] -= amount;
      }

      // Add the building and apply its effect
      this.buildings.push(building);
      //building.applyEffect(this);

      console.log(`Bought a ${building.name}`);
    } else {
      console.log('Not enough resources.');
    }
  }

  unlockFeature(feature) {
    this.unlockedFeatures.push(feature);
    console.log(`Unlocked feature: ${feature}`);
  }

  useHealingPotion() {
    if (this.coins >= 10) {
      this.currentHealth = Math.min(this.health, this.currentHealth + 100);
      this.coins -= 10;
      this.saveToLocalStorage(this);
    }
    else {

    }
  }

  generateResources(elapsedTime) {
    
    this.woodTimer += elapsedTime;
    if (this.woodTimer > 10000) {
      // Find all wood-generating buildings
      const woodGenerators = this.buildings.filter(building => building.name === 'Lumber Mill');
      let generatedWood = 0;
      woodGenerators.forEach(building => {
        generatedWood++;
      });
      
      this.logMessage(`Generated ${generatedWood} wood.`);
      this.wood += generatedWood;
      this.woodTimer -= 10000;
    }

    this.stoneTimer += elapsedTime;
    if (this.stoneTimer > 15000) {
      const stoneGenerators = this.buildings.filter(building => building.name === 'Stone Quarry');
      let generatedStone = 0;
      stoneGenerators.forEach(building => {
        generatedStone++;
    });
    
    this.logMessage(`Generated ${generatedStone} stone.`);
    this.stone += generatedStone;
      this.stoneTimer -= 15000;
    }
    this.saveToLocalStorage(this);
  }
}

export class Building {
  constructor(name, cost, type, effect) {
    this.name = name;
    this.cost = cost;  // Object with various resource costs
    this.type = type;  // 'generator', 'storage', 'feature' (to define the purpose)
    this.effect = effect;  // Effect applied after purchase (e.g., resource max increase)
  }

  // Check if the player can afford the building
  canAfford(resources) {
    for (const [resource, amount] of Object.entries(this.cost)) {
      if (resources[resource] < amount) {
        return false;
      }
    }
    console.log('can afford');
    return true;
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
      // Unlock features, e.g., research center
      character.unlockFeature(this.name);
    }
  }
}


// Define the array of buildings
export const buildings = [
  new Building(
    'Lumber Mill',
    { coins: 150 },  // Multi-resource cost
    'generator',
    { productionRate: 5 }  // Generates wood per second
  ),
  new Building(
    'Stone Quarry',
    { wood: 100, coins: 300 },
    'generator',
    { productionRate: 3 }
  ),
  new Building(
    'Storage Warehouse',
    { wood: 200, stone: 50, coins: 100 },
    'storage',
    { wood: 1000, stone: 500 }  // Increases max wood/stone storage
  ),
  new Building(
    'Research Center',
    { wood: 500, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'research' }  // Unlocks research for upgrades
  ),
];
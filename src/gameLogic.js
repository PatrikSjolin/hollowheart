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
    this.recordDepth = initialState.recordDepth || 0;
    this.diamonds = initialState.diamonds || 0;
    this.coins = initialState.coins || 0;
    this.unallocatedPoints = initialState.unallocatedPoints || 0;
    this.researchBoost = initialState.researchBoost || 1;
    this.experience = initialState.experience || 0;
    this.depth = initialState.depth || 0;
    this.ongoingResearch = initialState.ongoingResearch || null; // Track ongoing research
    this.researchEndTime = initialState.researchEndTime || null; // Track the time research will end
    this.isExploring = initialState.isExploring || false;
    this.buildings = initialState.buildings || [];
    this.lifeRegen = initialState.lifeRegen || 1; // Add life regeneration stat (1 HP every 20 seconds)
    this.lifeRegenRate = initialState.lifeRegenRate || 20;
    this.expBoost = initialState.expBoost || 1;
    this.wood = initialState.wood || 0;
    this.completedResearch = initialState.completedResearch || []; // Store completed research
    this.stone = initialState.stone || 0;
    this.regenTimer = 0; // Initialize regen timer for health regeneration
    this.treasureTimer = 0;
    this.rope = initialState.rope || 0; // Add rope item to the character
    this.hazardTimer = 0;
    this.woodTimer = 0;
    this.lastDepthVisited = initialState.lastDepthVisited || 0; // Store the last visited depth
    this.maxWood = initialState.maxWood || 100;  // Initial maximum amount of wood
    this.maxStone = initialState.maxStone || 100;  // Initial maximum amount of stone
    this.stoneTimer = 0;
    this.isLevelingUp = false; // New property to track level-up state
    this.libraryBuilt = initialState.libraryBuilt || false;
    this.saveToLocalStorage = saveToLocalStorage;
    saveToLocalStorage(this);
    this.logMessage = logMessage;
  }

  // Calculate max health based on vitality (10 HP per point of vitality)
  calculateMaxHealth() {
    return this.vitality * 10;
  }

  climbUp() {
    if (this.rope > 0 && this.depth > 0) {
      this.depth -= 1; // Climb up one depth
      this.rope -= 1; // Consume one rope
      this.logMessage(`You climbed up to depth ${this.depth} using one rope.`);
    } else if (this.rope === 0) {
      this.logMessage('You do not have any ropes to climb up.');
    }
    this.saveToLocalStorage(this);
  }

  buyRope() {
    if (this.coins >= 10) {
      this.rope += 1; // Buying one rope at a time
      this.coins -= 10;
      this.logMessage('You bought one rope.');
      this.saveToLocalStorage(this);
    }
  }

  // Regenerate health based on lifeRegen stat
  regenerateHealth(elapsedTime) {
    this.regenTimer += elapsedTime;
    const regenInterval = this.lifeRegenRate * 1000;

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

  sendHighscoreToServer() {
    // Send the highscore data to the server (This function will be defined later)
  }

  // Method to start exploring (descend)
  startExploring() {
    this.isExploring = true;
    if (this.depth === 0 && this.lastDepthVisited > 0) {
      this.depth = this.lastDepthVisited; // Go back to the last visited depth
    } else {
      this.depth += 1; // Otherwise, go down by 1 depth
    }
    if(this.depth > this.recordDepth) {
      this.recordDepth = this.depth;
      this.sendHighscoreToServer();  // Send highscore to the server
    }
    this.logMessage(`You descend to depth ${this.depth}`);
  }

  // Method to ascend (stop exploring)
  ascend() {
    if (this.isExploring) {
      this.isExploring = false;
      this.lastDepthVisited = this.depth; // Store the current depth before ascending
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

      const intelligenceFactor = (1 + this.intelligence) / this.intelligence;

      if (this.treasureTimer > treasureInterval) {
        // Simulate finding resources and gaining experience
        const resourceFound = {
          iron: Math.floor(Math.floor(Math.random() * 5) * this.depth * intelligenceFactor),
          gold: Math.floor(Math.floor(Math.random() * 3) * this.depth * intelligenceFactor),
          diamonds: Math.floor(this.depth >= 10 ? Math.floor(Math.random() * 2) * this.depth * intelligenceFactor : 0),
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

      const expGained = Math.floor(((1+this.intelligence) / this.intelligence) * this.depth * Math.floor(Math.random() * 20) + 5); // Random exp gained
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
    this.coins = 0;
    this.wood = Math.floor(this.wood * 0.1);
    this.stone = Math.floor(this.wood * 0.1);
    this.currentHealth = 0;
    this.ascend(); // Ascend back to the surface upon death
  }

  // Method for leveling up
  levelUp() {
    this.level += 1;
    this.unallocatedPoints += 5; // Allocate stat points
    this.isLevelingUp = true; // Set the level-up flag
    this.logMessage(`Level up! You are now level ${this.level} and gained 5 unallocated stat points.`);
      // Remove the level-up glow after a few seconds
      setTimeout(() => {
        this.isLevelingUp = false;
        this.saveToLocalStorage(this); // Save the updated state
      }, 3000);
    this.saveToLocalStorage(this); // Update React state
  }

  // Method to convert resources to coins
  convertToCoins(resourceType, amount) {
    let conversionRate = 1; // Define conversion rates
    switch (resourceType) {
      case 'iron':
        conversionRate = 1;
        this.coins += amount * conversionRate;
        this.logMessage(`Converted ${amount} Iron to ${amount * conversionRate} Coins.`);
        this.iron -= amount; // Subtract the converted amount
        break;
      case 'gold':
        conversionRate = 5;
        this.coins += amount * conversionRate;
        this.logMessage(`Converted ${amount} Gold to ${amount * conversionRate} Coins.`);
        this.gold -= amount; // Subtract the converted amount
        break;
      case 'diamonds':
        conversionRate = 10;
        this.coins += amount * conversionRate;
        this.logMessage(`Converted ${amount} Diamonds to ${amount * conversionRate} Coins.`);
        this.diamonds -= amount; // Subtract the converted amount
        break;
    }
    this.saveToLocalStorage(this); // Save the updated state
  }
  
  addDebugResources() {
    this.coins += 1000;
    this.wood += 1000;
    this.stone += 1000;
    this.iron += 1000;
    this.intelligence += 100;


    this.logMessage('Added 1000 coins, 100 wood, 100 stone, and 100 iron for debugging.');
    this.saveToLocalStorage(this); // Save to local storage to persist the resources
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
      building.applyEffect(this);

      console.log(`Bought a ${building.name}`);
    } else {
      console.log('Not enough resources.');
    }
    this.saveToLocalStorage(this);
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
  }

  startResearch(research, duration) {
    const now = new Date().getTime();
    this.ongoingResearch = { ...research };
    this.researchEndTime = now + duration; // Store the end time of the research
    this.saveToLocalStorage(this);
    this.logMessage(`Research "${research.name}" started.`);
  }

  getResearchProgress() {
    if (this.ongoingResearch && this.researchEndTime) {
      const now = new Date().getTime();
      const timeRemaining = this.researchEndTime - now;
      return Math.max(timeRemaining, 0); // Return the remaining time or 0 if completed
    }
    return null;
  }

  completeResearch() {
    if (this.ongoingResearch) {
      this.logMessage(`Research "${this.ongoingResearch.name}" completed!`);
      // Apply the effects of the completed research (increase life regen, exp boost, etc.)
      this.ongoingResearch.effect();
      this.completedResearch.push(this.ongoingResearch.name);
      this.ongoingResearch = null;
      this.researchEndTime = null;
      this.saveToLocalStorage(this);
    }
  }

  isResearchCompleted(researchName) {
    return this.completedResearch.includes(researchName);
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

      if (generatedWood > 0) {
        this.logMessage(`Generated ${generatedWood} wood.`);
        // console.log(this.wood + generatedWood);
        this.wood = Math.min(this.maxWood, this.wood + generatedWood);
      }
      this.woodTimer -= 10000;
    }

    this.stoneTimer += elapsedTime;
    if (this.stoneTimer > 15000) {
      const stoneGenerators = this.buildings.filter(building => building.name === 'Stone Quarry');
      let generatedStone = 0;
      stoneGenerators.forEach(building => {
        generatedStone++;
      });
      if (generatedStone > 0) {
        this.logMessage(`Generated ${generatedStone} stone.`);
        this.stone = Math.min(this.maxStone, this.stone + generatedStone);
      }
      this.stoneTimer -= 15000;
    }
    this.saveToLocalStorage(this);
  }
}

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
    console.log('can afford');
    return true;
  }

  isUnlocked(character){
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
    'Library',
    { wood: 300, coins: 300, iron: 50 },
    'feature',
    { unlocks: 'research' },  // Unlocks research for upgrades
    'Unlocks the ability to research.',
    function (character) { return character.buildings.some(building => building.name === 'Stone Quarry') && character.intelligence >= 20; }
  ),
];

export const items = [
  {
    name: 'Health Potion',
    description: 'Restores 100 health points.',
    cost: { coins: 10 },
    effect: (character) => {
      character.useHealingPotion(); // Apply the healing effect
    }
  },
  {
    name: 'Rope',
    description: 'Used to climb up one depth.',
    cost: { coins: 10 },
    effect: (character) => {
      character.buyRope(); // Add one rope to the inventory
    }
  }
];
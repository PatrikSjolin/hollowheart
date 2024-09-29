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
    this.buildings = initialState.buildings || { wood: 0, stone: 0 };
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
    // if (!this.isExploring) {
      this.isExploring = true;
      this.depth += 1; // Start at depth 1 or go deeper
      this.logMessage(`You descend to depth ${this.depth}`);
    // }
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
      //this.logMessage(elapsedTime);
      if (this.treasureTimer > treasureInterval) {
        // Simulate finding resources and gaining experience
        const resourceFound = {
          iron: Math.floor(Math.random() * 5),
          gold: Math.floor(Math.random() * 3),
          diamonds: Math.floor(Math.random() * 1),
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
        if (this.experience >= this.level * 200) {
          this.levelUp();
        }
        this.hazardTimer = this.hazardTimer - hazardInterval;
      }
      //this.saveToLocalStorage(this); // Update React state
    }
  }

  // Method to simulate encountering a hazard
  encounterHazard() {
    const hazardChance = Math.random(); // Random chance to encounter a hazard
    const dangerLevel = this.depth * 6; // Increased danger scaling

    if (hazardChance < 0.7) { // Increased chance of a hazard occurring (60%)
      const damage = Math.floor(Math.random() * dangerLevel) + 20; // Hazard deals more damage (min 10)
      this.currentHealth -= damage;
      this.logMessage(`You encountered a hazard and took ${damage} damage! Current health: ${this.currentHealth}.`);

      const expGained = Math.floor(Math.random() * 20) + 5; // Random exp gained
      this.experience += expGained;
      this.logMessage(`You survived and gained ${expGained} experience.`);

      // If health drops to zero or below, the character dies and returns to the surface
      if (this.currentHealth <= 0) {
        this.die();
      }

      //this.saveToLocalStorage(this); // Update React state
    }
  }

  // Method for the character to die and reset
  die() {
    this.logMessage("You have died and lost all resources gathered during the journey. Now you need to rest.");
    this.iron = 0;
    this.gold = 0;
    this.diamonds = 0;
    //this.currentHealth = this.health; // Respawn at full health
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
  buyBuilding(type) {
    const buildingCosts = {
      wood: 100,
      stone: 150,
    };

    if (this.coins >= buildingCosts[type]) {
      this.coins -= buildingCosts[type];
      this.buildings[type] += 1;
      this.logMessage(`Purchased a ${type} generator.`);
      //this.generateResource(type); // Start generating resources for that building
    } else {
      this.logMessage(`Not enough coins to buy ${type} generator.`);
    }

    this.saveToLocalStorage(this);
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
      if(this.buildings['wood'] > 0) {
        this.wood += this.buildings['wood'];
        this.logMessage(`Generated ${this.buildings['wood']} wood.`);
      }
      this.woodTimer -= 10000;
    }

    this.stoneTimer += elapsedTime;
    if (this.stoneTimer > 15000 && this.buildings['stone'] > 0) {
      if(this.buildings['stone'] > 0) {
        this.stone += this.buildings['stone'];
        this.logMessage(`Generated ${this.buildings['stone']} stone.`);
      }
      this.stoneTimer -= 15000;
    }
    this.saveToLocalStorage(this);
  }


  // Log helper method to log game messages
  logMessage(message) {
    console.log(message); // Can be improved to display in the game UI
  }
}

import { apiUrl } from './App';

export class Character {
  constructor(saveToLocalStorage, logMessage, showGeneralMessage, initialState = {}) {
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
    this.timeSurvivedAtLevel = initialState.timeSurvivedAtLevel || 0;
    this.expBoost = initialState.expBoost || 1;
    this.wood = initialState.wood || 0;
    this.completedResearch = initialState.completedResearch || []; // Store completed research
    this.stone = initialState.stone || 0;
    this.regenTimer = 0; // Initialize regen timer for health regeneration
    this.treasureTimer = 0;
    this.rope = initialState.rope || 0; // Add rope item to the character
    this.numberOfDeaths = initialState.numberOfDeaths || 0;
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
    this.showGeneralMessage = showGeneralMessage;
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

  // Regenerate health based on lifeRegen stat
  regenerateHealth(elapsedTime) {
    this.regenTimer += elapsedTime;
    const regenInterval = this.lifeRegenRate * 1000;

    if (this.regenTimer >= regenInterval) {
      
      const rounds = Math.floor(this.regenTimer / regenInterval);

      if (this.currentHealth < this.health) {
        this.currentHealth = Math.min(this.currentHealth + (this.lifeRegen) * rounds, this.health);
        this.logMessage(`Regenerated ${this.lifeRegen * rounds} health. Current health: ${this.currentHealth}`);
      }
      this.regenTimer = this.regenTimer - (regenInterval * rounds);
    }
  }

  sendHighscoreToServer(characterName, score) {
    // Send the highscore data to the server (This function will be defined later)
    fetch(apiUrl + '/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ characterName, score }),  // Sending character name and score
    })
      .then(response => response.json())
      .then(data => {
        console.log('High score submitted:', data.message);
      })
      .catch(error => {
        console.error('Error submitting high score:', error);
      });
  }

  // Method to start exploring (descend)
  startExploring() {
    if (this.currentHealth > 0) {
      this.isExploring = true;
      if (this.depth === 0 && this.lastDepthVisited > 0) {
        this.depth = this.lastDepthVisited; // Go back to the last visited depth
        this.logMessage(`You descend to depth ${this.depth}`);
      }
      else if(this.depth === 0) {
        this.depth = 1; // Otherwise, go down by 1 depth
        this.logMessage(`You descend to depth ${this.depth}`);
      }
       else if (this.timeSurvivedAtLevel > 6000) {
        this.depth += 1; // Otherwise, go down by 1 depth
        this.timeSurvivedAtLevel = 0;
        this.logMessage(`You descend to depth ${this.depth}`);
      }
      else {
        this.logMessage('Not ready to descend');
      }
      if (this.depth > this.recordDepth) {
        this.recordDepth = this.depth;
        this.sendHighscoreToServer(this.playerName, this.recordDepth);  // Send highscore to the server
      }
    }
    else {
      this.logMessage(`You can't decend while being dead.`);
    }
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
      this.timeSurvivedAtLevel += elapsedTime;

      const intelligenceFactor = this.calculateXpBoostFromIntelligence();

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
        if (this.experience >= this.calculateXpNeededForLevel(this.level)) {
          this.levelUp();
        }
        this.hazardTimer = this.hazardTimer - hazardInterval;
      }
    }
  }

  calculateXpNeededForLevel(level) {
    if(level === 0)
      return 0;

    return Math.floor(200 * Math.pow(1.5, level - 1));
  }

  // Method to simulate encountering a hazard
  encounterHazard() {
    const hazardChance = Math.random(); // Random chance to encounter a hazard
    const dangerLevel = this.depth * 15; // Increased danger scaling

    if (hazardChance < 0.7) { // Increased chance of a hazard occurring (60%)
      const damage = Math.floor(Math.random() * dangerLevel) + 6; // Hazard deals more damage (min 10)

      const damageReduction = this.calculateDamageReductionFromArmor();
      const damageTaken = Math.floor(damage * (1 - damageReduction));

      this.currentHealth -= damageTaken;
      this.logMessage(`You encountered a hazard and took ${damageTaken} damage! Current health: ${this.currentHealth}.`);
      console.log(`actual damage: ${damage}, reduction: ${damageReduction}`);

      const expGained = Math.floor(this.calculateXpBoostFromIntelligence() * this.depth * Math.floor(Math.random() * 20) + 5); // Random exp gained
      this.experience += expGained;
      this.logMessage(`You survived and gained ${expGained} experience.`);

      // If health drops to zero or below, the character dies and returns to the surface
      if (this.currentHealth <= 0) {
        this.die();
      }
    }
  }

  calculateQuantityBoostFromIntelligence() {
    return (1 + this.intelligence) / this.intelligence;
  }

  calculateXpBoostFromIntelligence() {
    return (1 + this.intelligence) / this.intelligence;
  }

  calculateDamageReductionFromArmor(){
    const armor = this.calculateArmor();
    return (armor / (armor + 120));
  }

  calculateArmor() {
    return this.strength * 4;
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
    this.numberOfDeaths++;
    this.treasureTimer = 0;
    this.timeSurvivedAtLevel = 0;
    this.experience = this.calculateXpNeededForLevel(this.level - 1);

    if (this.numberOfDeaths === 1) {
      this.showGeneralMessage('You died', 'Or not really. You will slowly regen back, but all resources are lost. Giving up might be a good choice.');  // Show the death overlay only on the first death
    }

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

      this.logMessage(`Bought a ${building.name}`);
    } else {
      this.logMessage('Not enough resources.');
    }
    this.saveToLocalStorage(this);
  }

  unlockFeature(feature) {
    this.unlockedFeatures.push(feature);
    this.logMessage(`Unlocked feature: ${feature}`);
  }

  buyRope() {
    if (this.coins >= 10) {
      this.rope += 1; // Buying one rope at a time
      this.coins -= 10;
      this.logMessage('You bought a rope.');
      this.saveToLocalStorage(this);
    }
  }

  useHealingPotion() {
    if (this.coins >= 10) {
      this.currentHealth = Math.min(this.health, this.currentHealth + 100);
      this.coins -= 10;
      this.logMessage('You bought a health potion.');
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
      const rounds = Math.floor(this.woodTimer / 10000);
      if (generatedWood > 0) {
        this.logMessage(`Generated ${generatedWood * rounds} wood.`);
        this.wood = Math.min(this.maxWood, this.wood + (generatedWood * rounds));
      }
      this.woodTimer -= 10000 * rounds;
    }

    this.stoneTimer += elapsedTime;
    if (this.stoneTimer > 15000) {
      const stoneGenerators = this.buildings.filter(building => building.name === 'Stone Quarry');
      let generatedStone = 0;
      stoneGenerators.forEach(building => {
        generatedStone++;
      });

      const rounds = Math.floor(this.stoneTimer / 15000);

      if (generatedStone > 0) {
        this.logMessage(`Generated ${generatedStone * rounds} stone.`);
        this.stone = Math.min(this.maxStone, this.stone + (generatedStone * rounds));
      }
      this.stoneTimer -= 15000 * rounds;
    }
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
}

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
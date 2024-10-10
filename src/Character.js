import { debug } from './App';
import { TIMERS, CHARACTER_CONFIG } from './GameConfig';

export class Character {
  constructor(saveToLocalStorage, logMessage, showGeneralMessage, setHighScores, initialState = {}) {
    this.playerName = initialState.playerName || 'Soldier';  // Fix here
    this.level = initialState.level || 1;
    this.strength = initialState.strength || 10;
    this.dexterity = initialState.dexterity || 10;
    this.vitality = initialState.vitality || 10;
    this.intelligence = initialState.intelligence || 10;
    this.currentHealth = initialState.currentHealth || 100;
    this.resources = initialState.resources || { coins: 0 };
    this.recordDepth = initialState.recordDepth || 0;
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
    this.attackTimer = initialState.attackTimer || 0;
    this.completedResearch = initialState.completedResearch || []; // Store completed research
    this.lastDepthVisited = initialState.lastDepthVisited || 0; // Store the last visited depth
    this.maxWood = initialState.maxWood || 100;  // Initial maximum amount of wood
    this.maxStone = initialState.maxStone || 100;  // Initial maximum amount of stone
    this.numberOfDeaths = initialState.numberOfDeaths || 0;
    this.libraryBuilt = initialState.libraryBuilt || false;
    this.depthConfigs = initialState.depthConfigs || {};  // Store depth configurations for consistency
    this.currentMonsters = initialState.currentMonsters || [];  // Initialize as an empty array to hold multiple monsters
    this.inventory = initialState.inventory || [];  // Add an inventory to store items
    this.equipment = initialState.equipment || {
      weapon: null,
      chest: null,
      boots: null,
      gloves: null,
    };
    this.regenTimer = 0;
    this.treasureTimer = 0;
    this.hazardTimer = 0;
    this.woodTimer = 0;
    this.health = this.calculateMaxHealth();
    this.stoneTimer = 0;
    this.isLevelingUp = false; // New property to track level-up state
    this.saveToLocalStorage = saveToLocalStorage;
    this.logMessage = logMessage;
    this.showGeneralMessage = showGeneralMessage;
    this.setHighScores = setHighScores;

    saveToLocalStorage(this);
  }

  calculateDamate() {

    let baseDamage = this.strength * 0.5;
    if (this.equipment.weapon) {
      baseDamage += this.equipment.weapon.bonus.attack; 
    }

    return Math.floor(baseDamage * (Math.random() + 1));
  }

  calculateAttackSpeed() {
    return (1 - (this.dexterity / (this.dexterity + 15))) * CHARACTER_CONFIG.baseAttackSpeed;
  }

  // Calculate max health based on vitality (10 HP per point of vitality)
  calculateMaxHealth() {
    return this.vitality * 10;
  }

  calculateQualityBoostFromIntelligence() {
    return 1 + (this.intelligence / (this.intelligence + 100));
  }

  calculateQuantityBoostFromIntelligence() {
    return 1 + (this.dexterity / (this.dexterity + 100));
  }

  calculateQuantityBoostFromDexterity() {
    return 1 + (this.dexterity / (this.dexterity + 100));
  }

  calculateXpBoostFromIntelligence() {
    return 1 + (this.intelligence / (this.intelligence + 100));
  }

  calculateDamageReductionFromArmor() {
    const armor = this.calculateArmor();
    return (armor / (armor + 120));
  }

  calculateArmor() {
    let armor = this.strength * 4;  // Base armor from strength
    if (this.equipment.chest) {
      armor += this.equipment.chest.bonus.armor;  // Add armor from equipped chest item
    }
    if (this.equipment.boots) {
      armor += this.equipment.boots.bonus.armor;
    }
    if (this.equipment.gloves) {
      armor += this.equipment.gloves.bonus.armor;
    }
    // Add bonuses from other equipped items as needed
    return armor;
  }

  calculateXpNeededForLevel(level) {
    if (level === 0)
      return 0;
    if (level === 1)
      return CHARACTER_CONFIG.baseXp;

    return Math.floor(CHARACTER_CONFIG.baseXp + CHARACTER_CONFIG.baseXp * Math.pow(CHARACTER_CONFIG.xpNeededPerLevelIncrease, level - 1));
  }

  modifyResource(resourceName, quantity) {
    if (!this.resources[resourceName]) {
      this.resources[resourceName] = 0;  // Initialize the resource if not already present
    }
    this.resources[resourceName] += quantity;  // Add or subtract resources
    this.resources[resourceName] = Math.max(0, this.resources[resourceName]);  // Ensure it doesn't go below 0
    this.saveToLocalStorage();
  }

  // Regenerate health based on lifeRegen stat
  regenerateHealth(elapsedTime) {
    this.regenTimer += elapsedTime;
    const regenInterval = this.lifeRegenRate * 1000;

    if (this.regenTimer >= regenInterval) {

      const rounds = Math.floor(this.regenTimer / regenInterval);

      if (this.currentHealth < this.health) {
        this.currentHealth = Math.min(this.currentHealth + (this.lifeRegen) * rounds, this.health);
        if (debug) {
          this.logMessage(`Regenerated ${this.lifeRegen * rounds} health.`);
        }
      }
      this.regenTimer = this.regenTimer - (regenInterval * rounds);
    }
  }

  equipItem(slot, item) {
    if (this.equipment[slot]) {
      this.logMessage(`You unequipped ${this.equipment[slot].name}.`);
      this.addItemToInventory(this.equipment[slot]);
    }
    this.equipment[slot] = item; // Assign the item to the equipment slot
    this.inventory = this.inventory.filter(inventoryItem => inventoryItem.id !== item.id); // Remove from inventory
    this.logMessage(`You equipped ${item.name}.`);
    this.saveToLocalStorage(this); // Save changes
  }

  unequipItem(slot) {
    const item = this.equipment[slot];
    if (item) {
      this.addItemToInventory(item);  // Add the unequipped item back to the inventory
      this.logMessage(`You unequipped ${item.name}.`);
      this.equipment[slot] = null;  // Remove the item from the slot
      this.saveToLocalStorage(this);
    }
  }

  // Add items to the inventory
  addItemToInventory(item) {
    // Check if the item stacks
    if (item.stacks) {
      const existingItem = this.inventory.find(invItem => invItem.name === item.name);
      if (existingItem) {
        existingItem.quantity += 1; // Increment the quantity
      } else {
        item.quantity = 1; // Add a quantity property to new stackable items
        this.inventory.push(item);
      }
    } else {
      this.inventory.push(item);  // Non-stackable items just get added
    }
    this.logMessage(`You acquired ${item.name}.`);
    this.saveToLocalStorage(this);
  }

  // Method for the character to die and reset
  die() {
    this.logMessage("You have died and lost all resources gathered during the journey. Now you need to rest.");
    
    Object.keys(this.resources).forEach(resourceKey => {
      this.resources[resourceKey] = 0;
    });

    this.currentHealth = 0;
    this.numberOfDeaths++;
    this.treasureTimer = 0;
    this.timeSurvivedAtLevel = 0;
    this.experience = this.calculateXpNeededForLevel(this.level - 1);

    if (this.numberOfDeaths === 1) {
      this.showGeneralMessage('You died', 'Or not really. You will slowly regen back, but all resources are lost. Giving up might be a good choice.');  // Show the death overlay only on the first death
    }
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

  // Method to buy buildings that generate resources
  buyBuilding(building) {
    // Check if the character can afford the building
    if (building.canAfford(this.resources)) {
      // Deduct the required resources
      for (const [resource, amount] of Object.entries(building.cost)) {
        this.resources[resource] = Math.max(0, (this.resources[resource] || 0) - amount);
      }
  
      // Add the building to the character's list of buildings
      this.buildings.push(building);
  
      // Apply the building's effect
      building.applyEffect(this);
  
      // Log the purchase and save the updated character state
      this.logMessage(`You have built a ${building.name}!`);
      this.saveToLocalStorage();
    } else {
      this.logMessage(`Not enough resources to build a ${building.name}.`);
    }
  }

  unlockFeature(feature) {
    this.unlockedFeatures.push(feature);
    this.logMessage(`Unlocked feature: ${feature}`);
  }

  useHealingPotion() {
    this.currentHealth = Math.min(this.health, this.currentHealth + 100);
    this.logMessage('You used a health potion.');
    this.saveToLocalStorage(this);
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
  
    if (this.woodTimer > TIMERS.woodGenerationInterval) {
      // Find all wood-generating buildings
      const woodGenerators = this.buildings.filter(building => building.name === 'Lumber Mill');
      let generatedWood = 0;
      woodGenerators.forEach(building => {
        generatedWood++;
      });
      const rounds = Math.floor(this.woodTimer / TIMERS.woodGenerationInterval);
      if (generatedWood > 0) {
        this.resources['wood'] = Math.min(this.maxWood, (this.resources['wood'] || 0) + (generatedWood * rounds));
        if (debug) {
          this.logMessage(`Generated ${generatedWood * rounds} wood.`);
        }
      }
      this.woodTimer -= TIMERS.woodGenerationInterval * rounds;
    }
  
    this.stoneTimer += elapsedTime;
  
    if (this.stoneTimer > TIMERS.stoneGenerationInterval) {
      const stoneGenerators = this.buildings.filter(building => building.name === 'Stone Quarry');
      let generatedStone = 0;
      stoneGenerators.forEach(building => {
        generatedStone++;
      });
  
      const rounds = Math.floor(this.stoneTimer / TIMERS.stoneGenerationInterval);
  
      if (generatedStone > 0) {
        this.resources['stone'] = Math.min(this.maxStone, (this.resources['stone'] || 0) + (generatedStone * rounds));
        if (debug) {
          this.logMessage(`Generated ${generatedStone * rounds} stone.`);
        }
      }
      this.stoneTimer -= TIMERS.stoneGenerationInterval * rounds;
    }

      this.saveToLocalStorage(this);
  }

  addDebugResources() {
    const debugResources = {
      wood: 100,
      stone: 100,
      iron: 50,
      gold: 25,
      emerald: 10,
      diamonds: 5,
      coins: 1000
    };
  
    // Add each resource to the character's resources object
    Object.keys(debugResources).forEach(resource => {
      this.resources[resource] = (this.resources[resource] || 0) + debugResources[resource];
      this.logMessage(`Added ${debugResources[resource]} ${resource}.`);
    });
  
    this.saveToLocalStorage();
  }
}
import { apiUrl } from './App';

export class Character {
  constructor(saveToLocalStorage, logMessage, showGeneralMessage, setHighScores, initialState = {}) {
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
    this.inventory = initialState.inventory || [];  // Add an inventory to store items
    this.equipment = initialState.equipment || {
      weapon: null,
      chest: null,
      boots: null,
      gloves: null,
    }; // Make sure equipment is stored
    this.regenTimer = 0; // Initialize regen timer for health regeneration
    this.treasureTimer = 0;
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
    this.setHighScores = setHighScores;
  }

  // Calculate max health based on vitality (10 HP per point of vitality)
  calculateMaxHealth() {
    return this.vitality * 10;
  }

  climbUp() {
    if (this.depth > 0) {
      this.depth -= 1;
      const rope = this.inventory.find(item => item.name === 'Rope');
      if (rope) {
        rope.quantity -= 1; // Decrease rope count by 1
        if (rope.quantity === 0) {
          // Remove the item if quantity is 0
          this.inventory = this.inventory.filter(item => item.name !== 'Rope');
        }
      }
      this.logMessage('You used a rope to climb up one depth.');
      this.saveToLocalStorage(this);
    }
  }

  // Regenerate health based on lifeRegen stat
  regenerateHealth(elapsedTime) {
    this.regenTimer += elapsedTime;
    const regenInterval = this.lifeRegenRate * 1000;

    if (this.regenTimer >= regenInterval) {

      const rounds = Math.floor(this.regenTimer / regenInterval);

      if (this.currentHealth < this.health) {
        this.currentHealth = Math.min(this.currentHealth + (this.lifeRegen) * rounds, this.health);
        this.logMessage(`Regenerated ${this.lifeRegen * rounds} health.`);
      }
      this.regenTimer = this.regenTimer - (regenInterval * rounds);
    }
  }
  equipItem(slot, item) {
    if (this.equipment[slot]) {
      this.logMessage(`You unequipped ${this.equipment[slot].name}.`);
      // Remove the effects of the previously equipped item (if any)
      // this.removeItemBonus(this.equipment[slot]);
    }
    this.equipment[slot] = item; // Assign the item to the equipment slot
    this.inventory = this.inventory.filter(inventoryItem => inventoryItem.name !== item.name); // Remove from inventory
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


  // Method to start exploring (descend)
  startExploring() {
    if (this.currentHealth > 0) {
      this.isExploring = true;
      if (this.depth === 0 && this.lastDepthVisited > 0) {
        this.depth = this.lastDepthVisited; // Go back to the last visited depth
        this.logMessage(`You descend to depth ${this.depth}`);
      }
      else if (this.depth === 0) {
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

        const itemFindChance = 0.1 * intelligenceFactor;  // 1% chance to find an item
        const randomChance = Math.random();

        if (randomChance < itemFindChance) {
          const foundItem = this.generateItem(this.depth, this.level, this.intelligence);
          if (foundItem !== undefined) {
            if (foundItem.type === 'consumable') {
              this.useHealingPotion();
            } else {
              this.addItemToInventory(foundItem);
            }

            this.logMessage(`You found a ${foundItem.name}!`);
          }
        }
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


  generateArmor(depth, level, intelligence) {
    const intelligenceFactor = this.calculateQuantityBoostFromIntelligence();
    const armorBonus = Math.floor(Math.random() * 10 * intelligenceFactor * (depth + 1) / depth);
    let finalSlot = '';

    const slotRoll = Math.floor(Math.random() * 3);

    if (slotRoll === 0) {
      finalSlot = 'chest';
    } else if (slotRoll === 1) {
      finalSlot = 'gloves';
    } else if (slotRoll === 2) {
      finalSlot = 'boots';
    }

    const name = `Rotten ${finalSlot} of trash`;

    return {
      name: name,
      type: 'equipable',
      stacks: false,
      slot: finalSlot,
      description: `Provides ${armorBonus} extra armor points.`,
      cost: { coins: 80 },
      bonus: { armor: armorBonus },
    };
  }

  generateWeapon(depth, level, intelligence) {
    return {
      name: 'Destroyed stick of crap',
      type: 'equipable',
      stacks: false,
      slot: 'weapon',
      description: `Provides 0 extra damage.`,
      cost: { coins: 80 },
      bonus: { attack: 0 },
    };
  }


  generateEquipableItem(depth, level, intelligence) {

    const typeOfSlot = Math.floor(Math.random * 2);

    if (typeOfSlot === 0) {
      return this.generateWeapon(depth, level, intelligence);
    }
    else if (typeOfSlot === 1) {
      return this.generateArmor(depth, level, intelligence);
    }
  }

  generateSpecial(depth, level, intelligence) {
    return {
      name: `Rope`,
      type: 'special',
      stacks: true,
      description: 'Used to climb up one depth.',
      cost: { coins: 10 },
    };
  }

  generateConsumable(depth, level, intelligence) {
    return {
      name: 'Health restore',
      type: 'consumable',
      stacks: false,
      description: 'Restores 100 health points.',
      cost: { coins: 10 },
      effect: (character) => {
        character.useHealingPotion(); // Apply the healing effect
      }
    }
  }

  generateItem(depth, level, intelligence) {

    const typeOfItem = Math.floor(Math.random() * 3);

    if (typeOfItem === 0) {

      return this.generateEquipableItem(depth, level, intelligence);
    }
    else if (typeOfItem === 1) {
      return this.generateSpecial(depth, level, intelligence);
    }
    else if (typeOfItem === 2) {
      return this.generateConsumable(depth, level, intelligence);
    }
  }

  calculateXpNeededForLevel(level) {
    if (level === 0)
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
      this.logMessage(`You encountered a hazard and took ${damageTaken} damage.`);

      const expGained = Math.floor(this.calculateXpBoostFromIntelligence() * this.depth * Math.floor(Math.random() * 20) + 5); // Random exp gained
      this.experience += expGained;
      this.logMessage(`You survived and gained ${expGained} experience.`);

      // If health drops to zero or below, the character dies and returns to the surface
      if (this.currentHealth <= 0) {
        this.die();
      }
    }
  }

  sendHighscoreToServer(characterName, score) {
    fetch(apiUrl + '/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ characterName, score }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('High score submitted:', data.message);
        // Fetch updated high scores after submission
        fetch(apiUrl + '/highscores', {
          headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
          }),
        })
          .then(response => response.json())
          .then(updatedData => this.setHighScores(updatedData)) // Update the local high scores state
          .catch(error => console.error('Error fetching updated high scores:', error));
      })
      .catch(error => {
        console.error('Error submitting high score:', error);
      });
  }


  calculateQuantityBoostFromIntelligence() {
    return (1 + this.intelligence) / this.intelligence;
  }

  calculateXpBoostFromIntelligence() {
    return (1 + this.intelligence) / this.intelligence;
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
    // Add bonuses from other equipped items as needed
    return armor;
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
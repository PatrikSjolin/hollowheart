import { TIMERS, MONSTER_CONFIG } from './GameConfig';
import { Item } from './item'
import { Monster } from './Monster'
import { debug } from './App';

export class Game {
  constructor(character, logMessage, saveToLocalStorage) {
    this.character = character;
    this.logMessage = logMessage;
    this.saveToLocalStorage = saveToLocalStorage;
    this.hazardActive = false;  // Track whether a hazard is currently active
    this.hazardEndTime = null;
    this.hazardTimer = 0;
  }

  // Randomly generate depth configuration
  generateDepthConfig(depth) {
    const dangerLevel = Math.min(depth / 5, 1);  // Danger increases with depth

    // Randomize whether this depth spawns monsters, hazards, etc.
    const spawnMonsters = Math.random() < dangerLevel;  // Higher chance of monsters deeper
    const spawnMonsterChance = 0.02 + Math.random() * dangerLevel * 0.1;
    const numberOfMonsterTypes = spawnMonsters ? Math.floor(Math.random() * 3 + 1) : 0;
    const monsterStrength = depth;  // Monsters get stronger as you go deeper

    const canTriggerHazards = Math.random() < dangerLevel * 0.5;  // Hazards more likely deeper
    const hazardSeverity = depth * 0.2;  // Hazard impact increases with depth

    const isPoisonous = Math.random() < dangerLevel * 0.3;  // Poisonous depths more likely deeper

    const resourceConfig = this.generateResourceConfig(depth);

    if(debug) {
      this.logMessage(`Depth: ${depth}. SpawnMonsters: ${spawnMonsters}. Chance to spawn monsters: ${spawnMonsterChance} NumberOfMonsterTypes: ${numberOfMonsterTypes}. CanTriggerHazards: ${canTriggerHazards}. HazardSeverity: ${hazardSeverity}. IsPoisonous: ${isPoisonous}`);
      this.logMessage(`Resource Config for Depth ${depth}: ${JSON.stringify(resourceConfig)}`);

    }

    return {
      spawnMonsters,
      spawnMonsterChance,
      numberOfMonsterTypes,
      monsterStrength,
      canTriggerHazards,
      hazardSeverity,
      isPoisonous,
      resourceConfig,
    };
  }

  // Generate random treasures based on depth
  generateResourceConfig(depth) {
    const availableResources = [
      { type: 'iron', depthStart: 1, probabilityRange: [0.7, 1.0] },
      { type: 'gold', depthStart: 4, probabilityRange: [0.3, 0.7] },
      { type: 'emeralds', depthStart: 10, probabilityRange: [0.2, 0.5] },
      { type: 'diamonds', depthStart: 15, probabilityRange: [0.1, 0.4] }
    ];
  
    const resourcePool = [];
  
    // Add resources based on depth
    availableResources.forEach(resource => {
      if (depth >= resource.depthStart) {
        const probability = this.randomInRange(resource.probabilityRange[0], resource.probabilityRange[1]);
        resourcePool.push({ type: resource.type, probability });
      }
    });
  
    // Randomly select up to 2 distinct resources
    const selectedResources = [];
    while (selectedResources.length < 2 && resourcePool.length > 0) {
      const randomIndex = Math.floor(Math.random() * resourcePool.length);
      const selectedResource = resourcePool.splice(randomIndex, 1)[0];  // Remove to avoid duplicates
      selectedResources.push(selectedResource);
    }
  
    return selectedResources;  // Return selected resources with their probabilities
  }
  
  // Helper function to generate random number within a range
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }


  ascend() {
    if (this.character.isExploring) {
      this.character.isExploring = false;
      this.character.lastDepthVisited = this.character.depth;  // Store the current depth before ascending
      this.logMessage(`You ascend back to the surface.`);
      this.character.depth = 0;  // Reset depth to 0
      this.saveToLocalStorage(this.character);  // Trigger React state update
    }
  }

  climbUp() {
    if (this.character.depth > 0) {
      this.character.depth -= 1;
      this.character.lastDepthVisited = this.character.depth;  // Store the current depth before ascending
      this.character.currentMonsters = [];
      const rope = this.character.inventory.find(item => item.name === 'Rope');
      if (rope) {
        rope.quantity -= 1; // Decrease rope count by 1
        if (rope.quantity === 0) {
          // Remove the item if quantity is 0
          this.character.inventory = this.character.inventory.filter(item => item.name !== 'Rope');
        }
      }

      if (!this.character.depthConfigs[this.character.depth]) {
        this.character.depthConfigs[this.character.depth] = this.generateDepthConfig(this.character.depth);
      }
      this.logMessage('You used a rope to climb up one depth.');
      this.saveToLocalStorage(this);
    }
  }

  // Method to start exploring (descend)
  descend() {
    if (this.character.currentHealth > 0) {
      this.character.currentMonsters = this.rehydrateMonsters(this.character.currentMonsters);
      if (debug) {
        this.logMessage('Hydrating monsters.');
      }
      if (this.character.depth === 0 && this.character.lastDepthVisited > 0) {
        this.character.depth = this.character.lastDepthVisited; // Go back to the last visited depth
        this.logMessage(`You descend to depth ${this.character.depth}`);
      }
      else if (this.character.depth === 0) {
        this.character.depth = 1; // Otherwise, go down by 1 depth
        this.logMessage(`You descend to depth ${this.character.depth}`);
      }
      else if (this.character.timeSurvivedAtLevel > TIMERS.timeNeededToCompleteLevel) {
        this.character.depth += 1; // Otherwise, go down by 1 depth
        this.character.timeSurvivedAtLevel = 0;
        this.logMessage(`You descend to depth ${this.character.depth}`);
      }
      else {
        this.logMessage('Not ready to descend');
      }

      if (!this.character.depthConfigs[this.character.depth]) {
        this.character.depthConfigs[this.character.depth] = this.generateDepthConfig(this.character.depth);
      }
      this.character.lastDepthVisited = this.character.depth;
      this.character.isExploring = true;
    }
    else {
      this.logMessage(`You can't descend while being dead.`);
    }
  }

  fightMonster(monster, index, elapsedTime, rounds) {
    monster.attackTimer += elapsedTime;
    const firstStrike = Math.random();
    if (firstStrike < 0.5) {
      if (monster.attackTimer > monster.attackInterval) {
        monster.attack(this.character);  // Monster attacks the character
        monster.attackTimer -= monster.attackInterval;
      }

      if (this.character.currentHealth <= 0) {
        this.manageDeath();
      } else if (this.character.attackTimer > this.character.calculateAttackSpeed()) {
        const damageDealt = this.character.calculateDamate();
        monster.health -= (damageDealt * rounds);
        this.logMessage(`You dealt ${rounds}x ${damageDealt} damage to the ${monster.name}.`);
      }

      // Check if the monster is dead
      if (monster.health <= 0) {
        const expGained = Math.floor(this.character.calculateXpBoostFromIntelligence() * this.character.depth * Math.floor(Math.random() * 6) + 5); // Random exp gained
        this.character.experience += expGained;
        const coinsGained = 1;
        this.character.coins += coinsGained;
        this.logMessage(`You defeated the ${monster.name}! and gained ${expGained} experience.`);
        this.character.currentMonsters.splice(index, 1);  // Remove the monster from the array
      }
    } else {
      if (this.character.attackTimer > this.character.calculateAttackSpeed()) {
        const damageDealt = this.character.calculateDamate();
        monster.health -= (damageDealt * rounds);
        this.logMessage(`You dealt ${rounds}x ${damageDealt} damage to the ${monster.name}.`);
      }

      // Check if the monster is dead
      if (monster.health <= 0) {
        const expGained = Math.floor(this.character.calculateXpBoostFromIntelligence() * this.character.depth * Math.floor(Math.random() * 6) + 5); // Random exp gained
        this.character.experience += expGained;
        const coinsGained = 1 + Math.floor(this.character.depth / 10);
        this.character.coins += coinsGained;
        this.logMessage(`You defeated the ${monster.name}! and gained ${expGained} experience.`);
        this.character.currentMonsters.splice(index, 1);  // Remove the monster from the array
      } else {
        if (monster.attackTimer > monster.attackInterval) {
          monster.attack(this.character);  // Monster attacks the character
          monster.attackTimer -= monster.attackInterval;
        }

        if (this.character.currentHealth <= 0) {
          this.manageDeath();
        }
      }
    }
  }


  generateTreasures(depthConfig) {

    const treasuresFound = [];
  
    depthConfig.resourceConfig.forEach(resourceConfig => {
      const roll = Math.random();
      if (roll <= resourceConfig.probability) {
        const quantity = Math.floor(Math.random() * 5 * this.character.depth) + 1;  // Scale quantity with depth
        this.character.resources[resourceConfig.type] = (this.character.resources[resourceConfig.type] || 0) + quantity;
        treasuresFound.push(`${quantity} ${resourceConfig.type}`);
      }
    });
  
    if (treasuresFound.length > 0) {
      this.logMessage(`You found: ${treasuresFound.join(', ')}.`);
    }

    //Find items
    const itemFindChance = 0.05 + this.character.calculateQuantityBoostFromDexterity() * this.character.depth * 0.05;
    const randomChance = Math.random();

    if (randomChance < itemFindChance) {
      const foundItem = Item.generateItem(this.character.depth, this.character.level, this.character.intelligence);
      if (foundItem !== undefined) {
        if (foundItem.type === 'consumable') {
          this.character.useHealingPotion();
        } else {
          this.character.addItemToInventory(foundItem);
        }

        this.logMessage(`You found a ${foundItem.name}!`);
      }
    }
  }

  // Exploration mechanism - gathering resources, finding items, gaining experience, and encountering hazards
  update(elapsedTime) {

    this.character.regenerateHealth(elapsedTime);
    this.character.generateResources(elapsedTime);

    if (this.character.isExploring) {
      
      const depthConfig = this.character.depthConfigs[this.character.depth];
      this.character.timeSurvivedAtLevel += elapsedTime;

      //Manage monsters
      const randomMonsterSpawn = Math.random();

      if(depthConfig.spawnMonsters && randomMonsterSpawn < depthConfig.spawnMonsterChance) {
        this.spawnMonster(this.character.depth);
      }

      this.character.attackTimer += elapsedTime;
      const rounds = Math.round(this.character.attackTimer / this.character.calculateAttackSpeed());
      this.character.currentMonsters.forEach((monster, index) => {
        this.fightMonster(monster, index, elapsedTime, rounds);
      });
      if (this.character.attackTimer > this.character.calculateAttackSpeed()) {
        this.character.attackTimer = this.character.attackTimer - rounds * this.character.calculateAttackSpeed();
      }

      //Manage treasures
      this.character.treasureTimer += elapsedTime;
      if (this.character.treasureTimer > TIMERS.treasureInterval) {
        this.generateTreasures(depthConfig);
        this.character.treasureTimer = this.character.treasureTimer - TIMERS.treasureInterval;
      }

      if (depthConfig.isPoisonous) {
        this.character.poisonDamageTimer += elapsedTime;
        if (this.character.poisonDamageTimer > TIMERS.poisonDamageInterval) {
          const poisonDamage = Math.floor(this.character.depth * 0.5);  // Damage increases with depth
          this.character.currentHealth -= poisonDamage;
          this.logMessage(`You are poisoned! Lost ${poisonDamage} HP.`);
          this.character.poisonDamageTimer = 0;  // Reset timer
        }
      }

      //Deal with new problems
      this.character.hazardTimer += elapsedTime;
      if (depthConfig.canTriggerHazards && this.character.hazardTimer > TIMERS.hazardInterval) {
        // Check for hazards (enemies or environments)
        const hazardChange = Math.random();
        if (hazardChange < 0.5) {
          this.encounterHazard();
        } 
        // Check if it's time to level up
        if (this.character.experience >= this.character.calculateXpNeededForLevel(this.character.level)) {
          this.character.levelUp();
        }
        this.character.hazardTimer = this.character.hazardTimer - TIMERS.hazardInterval;
      }
    }
  }

  manageDeath() {
    this.character.die();
    this.ascend(); // Ascend back to the surface upon death
  }

  spawnMonster(depth) {
    const randomHealth = Math.floor(Math.random() * 80) + MONSTER_CONFIG.baseHealth * depth;  // Example: Random health between 50 and 150
    const randomDamage = Math.floor(Math.random() * 10) + MONSTER_CONFIG.baseDamage * depth;  // Example: Random damage between 5 and 25
    const randomAttackInterval = Math.floor(Math.random() * (MONSTER_CONFIG.monsterAttackIntervalRange[1] - MONSTER_CONFIG.monsterAttackIntervalRange[0])) + (MONSTER_CONFIG.monsterAttackIntervalRange[0] / depth);  // Attack every 2-5 seconds

    const randomNumber = Math.floor(Math.random() * 100);

    const monster = new Monster('Worm ' + randomNumber, randomHealth, randomDamage, randomAttackInterval);  // Example monster

    this.logMessage(`A wild ${monster.name} has appeared with ${monster.health} HP!`);
    this.character.currentMonsters.push(monster);  // Add the spawned monster to the array
  }

  // Method to simulate encountering a hazard
  encounterHazard() {
    const hazardChance = Math.random(); // Random chance to encounter a hazard
    const dangerLevel = this.character.depth * 15; // Increased danger scaling

    if (hazardChance < 0.7) {
      const damage = Math.floor(Math.random() * dangerLevel) + 6;

      const damageReduction = this.character.calculateDamageReductionFromArmor();
      const damageTaken = Math.floor(damage * (1 - damageReduction));

      this.character.currentHealth -= damageTaken;
      this.logMessage(`You encountered a hazard and took ${damageTaken} damage.`);

      const expGained = Math.floor(this.character.calculateXpBoostFromIntelligence() * this.character.depth * Math.floor(Math.random() * 20) + 5); // Random exp gained
      this.character.experience += expGained;
      this.logMessage(`You survived and gained ${expGained} experience.`);

      // If health drops to zero or below, the character dies and returns to the surface
      if (this.character.currentHealth <= 0) {
        this.manageDeath();
      }
    }
  }

  // Handle hazards regardless of depth
  handleGlobalHazards(elapsedTime) {
    // If a hazard is active, count down its duration
    if (this.hazardActive) {
      const now = Date.now();
      const remainingTime = this.hazardEndTime - now;

      if (remainingTime > 0) {
        // Apply random hazard effects while the hazard is active
        this.applyHazardEffects(elapsedTime);
      } else {
        this.endHazard();
      }
    } else {
      // Start a new hazard at random intervals
      const hazardInterval = TIMERS.villageHazardMinCooldown;  // Hazards occur every 2 minutes
      this.hazardTimer += elapsedTime;

      if (this.hazardTimer >= hazardInterval) {
        this.startHazard();
        this.hazardTimer = 0;
      }
    }
  }

  // Start a new hazard
  startHazard() {
    const hazardDuration = Math.floor(Math.random() * 30000) + 30000;  // Hazards last between 30-60 seconds
    this.hazardEndTime = Date.now() + hazardDuration;
    this.hazardActive = true;
    this.logMessage('A disaster is happening in the village!');
  }

  // End the hazard
  endHazard() {
    this.hazardActive = false;
    this.hazardEndTime = null;
    this.logMessage('The disaster has passed.');
    this.saveToLocalStorage(this.character);
  }

  // Apply effects while the hazard is active
  applyHazardEffects(elapsedTime) {
    const causeAnIssue = Math.random();
    const randomEffect = Math.random();
  
    let lostResources = false;  // Track whether any resource was lost
  
    if (causeAnIssue < 0.1) {  // 10% chance to cause an issue
      if (randomEffect < 0.5) {
        // Randomly reduce wood if it exists in the resources
        const lostWood = Math.floor(Math.random() * 10 + 5);
        if (this.character.resources['Wood']) {
          this.character.resources['Wood'] = Math.max(0, this.character.resources['Wood'] - lostWood);
          this.logMessage(`The disaster destroyed ${lostWood} wood!`);
          lostResources = true;  // Mark that we lost resources
        }
      } else {
        // Randomly reduce stone if it exists in the resources
        const lostStone = Math.floor(Math.random() * 10 + 5);
        if (this.character.resources['Stone']) {
          this.character.resources['Stone'] = Math.max(0, this.character.resources['Stone'] - lostStone);
          this.logMessage(`The disaster destroyed ${lostStone} stone!`);
          lostResources = true;  // Mark that we lost resources
        }
      }
  
      // Only log if resources were actually lost
      if (lostResources) {
        this.saveToLocalStorage(this.character);
      }
    }
  }

  rehydrateMonsters(monsterDataArray) {
    return monsterDataArray.map(monsterData => {
      return new Monster(
        monsterData.name,
        monsterData.health,
        monsterData.damage,
        monsterData.attackInterval
      );
    });
  }
}

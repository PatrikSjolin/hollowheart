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
      this.character.currentMonsters = [];
      const rope = this.character.inventory.find(item => item.name === 'Rope');
      if (rope) {
        rope.quantity -= 1; // Decrease rope count by 1
        if (rope.quantity === 0) {
          // Remove the item if quantity is 0
          this.character.inventory = this.character.inventory.filter(item => item.name !== 'Rope');
        }
      }
      this.logMessage('You used a rope to climb up one depth.');
      this.saveToLocalStorage(this);
    }
  }

  // Method to start exploring (descend)
  startExploring() {
    if (this.character.currentHealth > 0) {
      this.character.currentMonsters = this.rehydrateMonsters(this.character.currentMonsters);
      this.logMessage('Hydrating monsters.');
      this.character.isExploring = true;
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

  // Exploration mechanism - gathering resources, finding items, gaining experience, and encountering hazards
  explore(elapsedTime) {

    //this.logMessage(this.character.isExploring);
    if (this.character.isExploring) {
      const treasureInterval = TIMERS.treasureInterval;
      this.character.treasureTimer += elapsedTime;
      this.character.timeSurvivedAtLevel += elapsedTime;

      const intelligenceFactor = this.character.calculateXpBoostFromIntelligence();
      this.character.attackTimer += elapsedTime;
      const rounds = Math.round(this.character.attackTimer / this.character.calculateAttackSpeed());

      this.character.currentMonsters.forEach((monster, index) => {
        this.fightMonster(monster, index, elapsedTime, rounds);
      });

      if (this.character.attackTimer > this.character.calculateAttackSpeed()) {
        // this.logMessage(`Attack timer  ${this.attackTimer}! New attacktimer: ${this.attackTimer - rounds * this.calculateAttackSpeed()} Rounds: ${rounds}.`);
        this.character.attackTimer = this.character.attackTimer - rounds * this.character.calculateAttackSpeed();
      }

      if (this.character.treasureTimer > treasureInterval) {
        // Simulate finding resources and gaining experience
        const resourceFound = {
          iron: Math.floor(Math.floor(Math.random() * 5) * this.character.depth * intelligenceFactor),
          gold: Math.floor(Math.floor(Math.random() * 3) * this.character.depth * intelligenceFactor),
          diamonds: Math.floor(this.depth >= 10 ? Math.floor(Math.random() * 2) * this.character.depth * intelligenceFactor : 0),
        };
        this.character.iron += resourceFound.iron;
        this.character.gold += resourceFound.gold;
        this.character.diamonds += resourceFound.diamonds;
        this.character.treasureTimer = this.character.treasureTimer - treasureInterval;
        this.logMessage(`You found ${resourceFound.iron} iron, ${resourceFound.gold} gold, and ${resourceFound.diamonds} diamonds.`);

        const itemFindChance = 0.1 * intelligenceFactor;  // 1% chance to find an item
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

      const hazardInterval = TIMERS.hazardInterval;
      this.character.hazardTimer += elapsedTime;
      if (this.character.hazardTimer > hazardInterval) {
        // Check for hazards (enemies or environments)
        const typeOfHazard = Math.floor(Math.random() * 2);
        if (typeOfHazard === 0) {
          this.encounterHazard();
        } else if (typeOfHazard === 1) {
          const spawnMonster = Math.random();
          if (spawnMonster < 0.3) {
            this.spawnMonster(this.character.depth);
          }
        }

        // Check if it's time to level up
        if (this.character.experience >= this.character.calculateXpNeededForLevel(this.character.level)) {
          this.character.levelUp();
        }
        this.character.hazardTimer = this.character.hazardTimer - hazardInterval;
      }
    }
  }

  manageDeath() {
    this.character.die();
    this.ascend(); // Ascend back to the surface upon death
  }

  spawnMonster(depth) {
    const randomHealth = Math.floor(Math.random() * 100) + MONSTER_CONFIG.baseHealth * depth;  // Example: Random health between 50 and 150
    const randomDamage = Math.floor(Math.random() * 20) + MONSTER_CONFIG.baseDamage * depth;  // Example: Random damage between 5 and 25
    const randomAttackInterval = Math.floor(Math.random() * (MONSTER_CONFIG.monsterAttackIntervalRange[1] - MONSTER_CONFIG.monsterAttackIntervalRange[0])) + (MONSTER_CONFIG.monsterAttackIntervalRange[0] / depth);  // Attack every 2-5 seconds

    const monster = new Monster('Worm', randomHealth, randomDamage, randomAttackInterval);  // Example monster

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


    if (causeAnIssue < 0.1) {
      if (randomEffect < 0.5) {
        // Randomly reduce wood
        const lostWood = Math.floor(Math.random() * 10 + 5);
        this.character.wood = Math.max(0, this.character.wood - lostWood);
        this.logMessage(`The disaster destroyed ${lostWood} wood!`);
      } else {
        // Randomly reduce stone
        const lostStone = Math.floor(Math.random() * 10 + 5);
        this.character.stone = Math.max(0, this.character.stone - lostStone);
        this.logMessage(`The disaster destroyed ${lostStone} stone!`);
      }

      // Add a delay between each bad event (e.g., resource loss)
      this.saveToLocalStorage(this.character);
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

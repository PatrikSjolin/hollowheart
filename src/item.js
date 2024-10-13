import { generateUniqueId } from './Utilities'
import { ShopService } from './ShopService';
import { debug } from './App';

export class Item {


  static getResearches(character, shopItems, setShopItems) {
    return [
      {
        name: 'Increased Life Regen',
        description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 10 seconds.',
        timeRequired: 30 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 30 minutes in milliseconds
        unlockCondition: character.intelligence >= 20, // Example condition based on intelligence
        effect: () => {
          character.lifeRegenRate = 10; // Apply effect to character
        },
        cost: { coins: 500, iron: 100, gold: 100 },
      },
      {
        name: 'Improved stat booster restore',
        description: 'Random stat increased by 20 instead of 10 but costs gold instead of iron.',
        timeRequired: 30 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 30 minutes in milliseconds
        unlockCondition: character.intelligence >= 20, // Example condition based on intelligence
        effect: () => {
          // Add the upgraded stat booster to the shop
          const improvedBooster = Item.dynamicItemTemplates.find(item => item.name === 'Improved Stat Booster');
          ShopService.addNewItemToShop(improvedBooster, shopItems, setShopItems);
        },
        cost: { coins: 5000, iron: 100, gold: 1000 },
      },
      {
        name: 'A day of work',
        description: 'Receive unallocated stat points equal to your current dexterity.',
        timeRequired: 24 * 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 30 minutes in milliseconds
        unlockCondition: character.intelligence >= 20, // Example condition based on intelligence
        effect: () => {
          // Add the upgraded stat booster to the shop
          character.unallocatedPoints = character.unallocatedPoints + character.dexterity;
        },
        cost: { coins: 100000, iron: 10000, gold: 1000 },
      },
      {
        name: 'Improved library',
        description: 'Research 20% faster',
        timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
        unlockCondition: character.intelligence >= 100, // Example condition based on owning buildings
        effect: () => {
          character.researchBoost = 1.2; // Apply effect to character
        },
        cost: { coins: 100000, iron: 10000, gold: 1000 },
      },
      {
        name: 'Increased Experience Boost',
        description: 'Increase experience gained by 50%.',
        timeRequired: 120 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
        unlockCondition: character.intelligence >= 25, // Example condition based on owning buildings
        effect: () => {
          character.expBoost = 1.5; // Apply 15% boost to experience gained
        },
        cost: { coins: 10000, emeralds: 1000 },
      },
      {
        name: 'Golden Life Regen',
        description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 5 seconds.',
        timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
        unlockCondition: character.intelligence >= 25 && character.isResearchCompleted('Increased Life Regen'), // Example condition based on owning buildings
        effect: () => {
          character.lifeRegenRate = 5; // Apply effect to character
        },
        cost: { coins: 100000, iron: 10000, gold: 10000 },
      },
      {
        name: 'Heavy Life Regen',
        description: 'Increase life regeneration rate from 1 hitpoints per tick to 3.',
        timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
        unlockCondition: character.intelligence >= 30 && character.isResearchCompleted('Increased Life Regen'), // Example condition based on owning buildings
        effect: () => {
          character.lifeRegen = 3; // Apply effect to character
        },
        cost: { coins: 100000, iron: 10000, gold: 1000 },
      },
    ];
  }


  static defaultItems = [
    {
      name: 'Health restore',
      type: 'consumable',
      stacks: false,
      description: 'Restores 100 health points.',
      cost: { coins: 10 },
      effect: (character) => {
        character.useHealingPotion(100); // Apply the healing effect
      }
    },
    {
      id: generateUniqueId(),  // Unique identifier for each item
      name: `Rope`,
      type: 'special',
      stacks: true,
      description: 'Used to climb up one depth.',
      cost: { coins: 10 },
    },
    {
      id: generateUniqueId(),  // Unique identifier for each item
      name: 'Broken sword',
      type: 'equipable',
      stacks: false,
      slot: 'weapon',
      description: 'A "sword" that "increases" your attack power by 5.',
      cost: { coins: 50 },
      bonus: { attack: 5 },
    },
    {
      id: generateUniqueId(),  // Unique identifier for each item
      name: 'Disgusting vest',
      type: 'equipable',
      stacks: false,
      slot: 'chest',
      description: 'Provides 7 extra armor points.',
      cost: { coins: 80 },
      bonus: { armor: 7 },
    },
    {
      id: generateUniqueId(),
      name: 'Stat Booster',
      type: 'consumable',
      stacks: false,
      description: 'Randomly increases one of your stats by 10 for 10 minutes.',
      cost: { coins: 100, iron: 20 },
      effect: (character) => {
        const stats = ['strength', 'dexterity', 'vitality', 'intelligence'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        // Check if there's already a "Stat Boost" buff and remove it
        character.logMessage(character.hasBuff('Stat Boost'));
        if (character.hasBuff('Stat Boost')) {
          character.removeEffect('Stat Boost');  // Properly remove the existing buff
          character.logMessage('Previous Stat Boost expired.');
        }

        // Apply the new "Stat Boost" buff
        character.applyEffect({
          name: 'Stat Boost',
          type: 'buff',
          statAffected: randomStat,
          amount: 10,
          duration: 10 * 60 * 1000, // 5 minutes
          overtime: false,
        });
        character.logMessage(`Your ${randomStat} increased by 10 for 10 minutes.`);
      }
    },
  ];

  static dynamicItemTemplates = [
    {
      name: 'Improved Stat Booster',
      type: 'consumable',
      stacks: false,
      cost: { coins: 300, gold: 20 },
      description: 'Random stat increased by 20 for 10 minutes.',
      effect: (character) => {
        const stats = ['strength', 'dexterity', 'vitality', 'intelligence'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];

        if (character.hasBuff('Imp Stat Boost')) {
          character.removeEffect('Imp Stat Boost');
          character.logMessage('Previous Stat Boost expired.');
        }

        character.applyEffect({
          name: 'Imp Stat Boost',
          type: 'buff',
          statAffected: randomStat,
          amount: 20,
          duration: 10 * 60 * 1000,
          overTime: false,
        });
        character.logMessage(`Your ${randomStat} increased by 20 for 10 minutes.`);
      }
    },
    // Add other dynamic items here
  ];


  static prefixes = [
    "Dung-Induced", "Shitty", "Rusty", "Crusty", "Broken", "Dirty", "Grease-Soaked",
    "Moldy", "Unfortunate", "Cursed", "Grimy", "Vomit-Stained", "Half-Eaten",
    "Filthy", "Soggy", "Inferior", "Pathetic", "Misguided", "Muck-Infused",
    "Foul-Smelling", "Disastrous", "Unwashed", "Shameful", "Disgusting", "Stinky",
    "Muddy", "Rotten", "Junky", "Crappy", "Badly-Made", "Cheap"
  ];

  static suffixes = [
    "of Crap", "of Garbage", "of Misfortune", "of Despair", "of Worthlessness",
    "of Regret", "of Uselessness", "of the Dumpster", "of Failure", "of Disgust",
    "of the Sewer", "of Embarrassment", "of Defeat", "of the Trash Heap", "of Waste",
    "of the Pit", "of Ruin", "of Humiliation", "of the Underworld", "of Neglect",
    "of Confusion", "of the Forgotten", "of the Abyss", "of Banishment", "of the Unlucky",
    "of Doom", "of the Lost Cause", "of Desperation", "of Disrepair"
  ];

  static generateRandomItemName(baseName) {
    const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
    return `${prefix} ${baseName} ${suffix}`;
  }

  static generateArmor(depth, level, quality) {

    const armorBonus = Math.floor(Math.random() * 10 * quality * (depth + 1) / depth);
    let finalSlot = '';

    const slotRoll = Math.floor(Math.random() * 3);

    if (slotRoll === 0) {
      finalSlot = 'chest';
    } else if (slotRoll === 1) {
      finalSlot = 'gloves';
    } else if (slotRoll === 2) {
      finalSlot = 'boots';
    }

    const name = this.generateRandomItemName(finalSlot);

    return {
      id: generateUniqueId(),  // Unique identifier for each item
      name: name,
      type: 'equipable',
      stacks: false,
      slot: finalSlot,
      description: `Provides ${armorBonus} extra armor points.`,
      cost: { coins: armorBonus * 2 },
      bonus: { armor: armorBonus },
    };
  }

  static generateWeapon(depth, level, quality) {

    const name = this.generateRandomItemName('sword');
    const dmgBonus = Math.floor(Math.random() * 10 * quality * (depth + 1) / depth);
    return {
      id: generateUniqueId(),  // Unique identifier for each item
      name: name,
      type: 'equipable',
      stacks: false,
      slot: 'weapon',
      description: `Provides ${dmgBonus} extra damage.`,
      cost: { coins: dmgBonus * 2 },
      bonus: { attack: dmgBonus },
    };
  }

  static generateEquipableItem(depth, level, quality) {
    console.log('generate equipable item');
    const typeOfSlot = Math.floor(Math.random() * 2);
    console.log('slot ' + typeOfSlot);
    if (typeOfSlot === 0) {
      return this.generateWeapon(depth, level, quality);
    }
    else if (typeOfSlot === 1) {
      return this.generateArmor(depth, level, quality);
    }
  }

  static generateSpecial(depth, level, quality) {
    return {
      id: generateUniqueId(),  // Unique identifier for each item
      name: `Rope`,
      type: 'special',
      stacks: true,
      description: 'Used to climb up one depth.',
      cost: { coins: 10 },
    };
  }

  static generateConsumable(depth, level, quality) {
    return {
      id: generateUniqueId(),  // Unique identifier for each item
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

  static generateItem(depth, level, quality) {

    const typeOfItem = Math.floor(Math.random() * 3);

    if (typeOfItem === 0) {
      return this.generateEquipableItem(depth, level, quality);
    }
    else if (typeOfItem === 1) {
      return this.generateSpecial(depth, level, quality);
    }
    else if (typeOfItem === 2) {
      return this.generateConsumable(depth, level, quality);
    }
  }
}
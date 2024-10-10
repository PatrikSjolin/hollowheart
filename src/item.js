import { generateUniqueId } from './Utilities'

export class Item {

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

  static generateArmor(depth, level, intelligence) {
    const intelligenceFactor = 1 - ((intelligence) / (intelligence + 100));
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

  static generateWeapon(depth, level, intelligence) {
    
    const name = this.generateRandomItemName('sword');
    const intelligenceFactor = 1 - ((intelligence) / (intelligence + 100));
    const dmgBonus = Math.floor(Math.random() * 10 * intelligenceFactor * (depth + 1) / depth);
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

  static generateEquipableItem(depth, level, intelligence) {
    console.log('generate equipable item');
    const typeOfSlot = Math.floor(Math.random() * 2);
    console.log('slot ' + typeOfSlot);
    if (typeOfSlot === 0) {
      return this.generateWeapon(depth, level, intelligence);
    }
    else if (typeOfSlot === 1) {
      return this.generateArmor(depth, level, intelligence);
    }
  }

  static generateSpecial(depth, level, intelligence) {
    return {
      id: generateUniqueId(),  // Unique identifier for each item
      name: `Rope`,
      type: 'special',
      stacks: true,
      description: 'Used to climb up one depth.',
      cost: { coins: 10 },
    };
  }

  static generateConsumable(depth, level, intelligence) {
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

  static generateItem(depth, level, intelligence) {

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
}
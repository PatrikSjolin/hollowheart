export class Item {

  static generateArmor(depth, level, intelligence) {
    console.log('generate armor');
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

  static generateWeapon(depth, level, intelligence) {
    console.log('generate weapon');
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
      name: `Rope`,
      type: 'special',
      stacks: true,
      description: 'Used to climb up one depth.',
      cost: { coins: 10 },
    };
  }

  static generateConsumable(depth, level, intelligence) {
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
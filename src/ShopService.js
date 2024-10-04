export class ShopService {
  static convertToCoins(character, resourceType, amount) {
    let conversionRate = 1;
    switch (resourceType) {
      case 'iron':
        conversionRate = 1;
        character.coins += amount * conversionRate;
        character.iron -= amount;
        break;
      case 'gold':
        conversionRate = 5;
        character.coins += amount * conversionRate;
        character.gold -= amount;
        break;
      case 'diamonds':
        conversionRate = 10;
        character.coins += amount * conversionRate;
        character.diamonds -= amount;
        break;
      default:
        return;
    }
    character.logMessage(`Converted ${amount} ${resourceType} to ${amount * conversionRate} Coins.`);
    character.saveToLocalStorage(character);  // Save updated state
  }

  static conversionRates = {
    iron: 1,
    gold: 5,
    diamonds: 10,
  };
  
  static initializeShopStock = () => {
    const defaultItems = [
      {
        name: 'Health restore',
        type: 'consumable',
        stacks: false,
        description: 'Restores 100 health points.',
        cost: { coins: 10 },
        effect: (character) => {
          character.useHealingPotion(); // Apply the healing effect
        }
      },
      {
        name: `Rope`,
        type: 'special',
        stacks: true,
        description: 'Used to climb up one depth.',
        cost: { coins: 10 },
      },
      {
        name: 'Broken sword',
        type: 'equipable',
        stacks: false,
        slot: 'weapon',
        description: 'A "sword" that "increases" your attack power by 1.',
        cost: { coins: 50 },
        bonus: { attack: 5 },
      },
      {
        name: 'Disgusting vest',
        type: 'equipable',
        stacks: false,
        slot: 'chest',
        description: 'Provides 7 extra armor points.',
        cost: { coins: 80 },
        bonus: { armor: 7 },
      }
    ];

    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (!savedShopStock) {
      localStorage.setItem('shopStock', JSON.stringify(defaultItems));
      return defaultItems;
    }
    return savedShopStock;
  };

  static addNewItemToShop(newItem, shopItems, setShopItems) {
    const updatedShopStock = [...shopItems, newItem];
    setShopItems(updatedShopStock);
    localStorage.setItem('shopStock', JSON.stringify(updatedShopStock));
  };
}

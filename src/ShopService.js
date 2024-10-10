import { generateUniqueId } from './Utilities'
import translations from './translations'; // Import translations

export class ShopService {
  static convertToCoins(character, resourceType, amount, language) {
    const conversionRate = this.conversionRates[resourceType];
    
    // Ensure the resource is available and that the character has enough to convert
    if (!character.resources[resourceType] || character.resources[resourceType] < amount) {
      character.logMessage(`Not enough ${resourceType} to convert.`);
      return;
    }

    // Convert the resource into coins
    const coinsEarned = amount * conversionRate;
    character.resources[resourceType] -= amount;
    character.resources['coins'] = (character.resources['coins'] || 0) + coinsEarned;

    // Log the transaction with the translated resource name
    character.logMessage(`Converted ${amount} ${resourceType} to ${coinsEarned} coins.`);
    
    // Save the updated state
    character.saveToLocalStorage();
  }

  static conversionRates = {
    iron: 1,
    gold: 5,
    emerald: 10,
    diamonds: 50,
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
        description: 'Randomly increases one of your stats by 10 for 5 minutes.',
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
              duration: 5 * 60 * 1000, // 5 minutes
              overtime: false,
          });
          character.logMessage(`Your ${randomStat} increased by 10 for 5 minutes.`);
      }
      },
    ];

    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (!savedShopStock) {
      localStorage.setItem('shopStock', JSON.stringify(defaultItems));
      return defaultItems;
    }
    return savedShopStock;
  };

  static rehydrateShopItems(shopItems) {
    return shopItems.map(item => {
      // Check for consumables and reassign their effects
      if (item.type === 'consumable') {
        switch (item.name) {
          case 'Health restore':
            item.effect = (character) => character.useHealingPotion();
            break;
          case 'Stat Booster':
            item.effect = (character) => {
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
                  duration: 5 * 60 * 1000, // 5 minutes
                  overtime: false,
              });
              character.logMessage(`Your ${randomStat} increased by 10 for 5 minutes.`);
          }
            break;
          // Add other consumables as needed
        }
      }
      return item;
    });
  }


  static addNewItemToShop(newItem, shopItems, setShopItems) {
    const updatedShopStock = [...shopItems, newItem];
    setShopItems(updatedShopStock);
    localStorage.setItem('shopStock', JSON.stringify(updatedShopStock));
  };
}

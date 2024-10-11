
import { Item } from './item';

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
    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (!savedShopStock) {
      localStorage.setItem('shopStock', JSON.stringify(Item.defaultItems));
      return Item.defaultItems;
    }
    return savedShopStock;
  };

   static rehydrateShopItems(shopItems) {
    return shopItems.map(item => {
      // Reassign the effect function for consumable items if necessary
      const matchingItem = Item.defaultItems.find(defaultItem => defaultItem.name === item.name)
      || Item.dynamicItemTemplates.find(dynamicItem => dynamicItem.name === item.name);

      if (matchingItem && matchingItem.effect) {
        item.effect = matchingItem.effect;
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

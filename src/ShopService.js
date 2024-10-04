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
}

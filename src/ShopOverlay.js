import React, { useState, useEffect } from 'react';
import { buildings } from './building';
import translations from './translations';
import { ShopService } from './ShopService';

const ShopOverlay = ({ character, setCharacter, setShopOverlayVisible, language, shopItems, setShopItems }) => {
  const [activeTab, setActiveTab] = useState('conversion');  // State to manage active tab
  const [convertAmount, setConvertAmount] = useState({ iron: 0, gold: 0, emeralds: 0, diamonds: 0, });

  const handleSliderChange = (resource, value) => {
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: value,
    }));
  };

  useEffect(() => {
    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (savedShopStock) {
      const rehydratedItems = ShopService.rehydrateShopItems(savedShopStock);
      setShopItems(rehydratedItems);  // Restore the shop items from localStorage
    }
  }, []);

  // Handle max button click to set the slider to the maximum value
  const handleMaxClick = (resource) => {
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: character.resources[resource],
    }));
  };

  const handleConvert = (resource) => {
    ShopService.convertToCoins(character, resource, convertAmount[resource]);
    setCharacter(character);
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: 0,
    }));
  };

  // Close the overlay when clicking outside the overlay content
  const handleClickOutside = (e) => {
    if (e.target.classList.contains('overlay')) {
      setShopOverlayVisible(false);
    }
  };

  // Close the overlay when pressing Escape
  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      setShopOverlayVisible(false);
    }
  };

  const handleBuyItem = (item, index) => {
    if (character.resources['coins'] >= item.cost.coins) {
      if (item.type === 'consumable') {
        item.effect(character);  // Consumable is used immediately
        character.logMessage(`${item.name} used.`);
      } else {
        // Add equipable or stackable items to inventory
        character.addItemToInventory(item);
      }
      character.resources['coins'] -= item.cost.coins;

      if (item.cost.iron) {
        character.resources['iron'] -= item.cost.iron;
      }

      setCharacter(character);  // Update character state

      // If the item is not consumable or special, remove it from the shop stock
      if (item.type !== 'consumable' && item.type !== 'special') {
        const updatedShopStock = shopItems.filter((shopItem, i) => shopItem.id !== item.id);
        setShopItems(updatedShopStock);
        localStorage.setItem('shopStock', JSON.stringify(updatedShopStock));  // Save updated stock to localStorage
      }
    }
  };

  const handleSellItem = (item) => {
    const sellPrice = item.cost.coins * 0.5;  // Example: Sell price is twice the attack bonus
    character.resources['coins'] += sellPrice;
    character.inventory = character.inventory.filter(inventoryItem => inventoryItem.id !== item.id);
    setCharacter(character);
    character.saveToLocalStorage(character);
    setShopItems([...shopItems]);  // Force re-render
    character.logMessage(`Sold ${item.name} for ${sellPrice} coins.`);
  };


  useEffect(() => {
    // Add event listener for click outside
    document.addEventListener('click', handleClickOutside);
    // Add event listener for escape key
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div className="overlay">
      <div className="overlay-content">
        <span className="close-btn" onClick={() => setShopOverlayVisible(false)}>&times;</span>

        {/* Tab Navigation */}
        <div className="shop-tabs">
          <button
            onClick={() => setActiveTab('conversion')}
            className={activeTab === 'conversion' ? 'active' : ''}
          >
            {translations[language].convertResources}
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={activeTab === 'buildings' ? 'active' : ''}
          >
            {translations[language].buyBuildings}
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={activeTab === 'items' ? 'active' : ''}
          >
            {translations[language].buyItems}
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={activeTab === 'sell' ? 'active' : ''}
          >
            {translations[language].sellItems}
          </button>
        </div>

        {/* Fixed Height for Tab Content */}
        <div className="tab-content">
          {activeTab === 'conversion' && (
            <div className="conversion-section">
                {['iron', 'gold', 'emeralds', 'diamonds'].filter(resource => character.resources[resource] >= 0).map(resource => (
    <div key={resource} className="conversion-row">
      <p>{translations[language][resource]}: {character.resources[resource]}</p>
      <p>{translations[language].convertTo} {convertAmount[resource] * ShopService.conversionRates[resource]} {translations[language].coins}</p>
      <input
        type="range"
        min="0"
        max={character.resources[resource]}
        value={convertAmount[resource]}
        onChange={(e) => handleSliderChange(resource, e.target.value)}
      />
      <span>{convertAmount[resource]}</span>

      {/* Max Button */}
      <button onClick={() => handleMaxClick(resource)} className="max-button">
        Max
      </button>

      <button onClick={() => handleConvert(resource)} disabled={convertAmount[resource] <= 0 || character.isExploring} className="shop-button">
        {translations[language].trade}
      </button>
    </div>
  ))}
              <hr className="section-divider" />
              {/* Add Consumables here */}
              <h2>{translations[language].buyConsumables}</h2>
              {shopItems.filter(item => item.type === 'consumable').map((item, index) => (
                <div key={index} className="item-block">
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-description">{item.description}</p>
                    <p className="item-cost">
                      {Object.entries(item.cost).map(([resource, amount]) => (
                        <span key={resource}> {resource}: {amount} </span>
                      ))}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleBuyItem(item, index)  // Use the dynamic handler
                    }}
                    disabled={character.resources['coins'] < item.cost.coins || (character.resources['iron'] < item.cost.iron) || character.depth > 0}
                    className="shop-button"
                  >
                    {translations[language].buy}
                  </button>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'buildings' && (
            <div className="buildings-section">
              {buildings.filter(building => building.isUnlocked(character)).map((building, index) => (
                <div key={index} className="building-block">
                  <div className="building-info">
                    <p className="building-name">{building.name}</p>
                    <p className="building-description">{building.description}</p>
                    <p className="building-cost">
                      {Object.entries(building.cost).map(([resource, amount]) => (
                        <span key={resource}> {resource}: {amount} </span>
                      ))}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (building.canAfford(character.resources)) {
                        character.buyBuilding(building);
                        setCharacter(character);
                      }
                    }}
                    disabled={!building.canAfford(character.resources)}
                    className="shop-button"
                  >
                    {translations[language].buy}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'items' && (
            <div className="items-section">
              {shopItems.filter(item => item.type !== 'consumable').map((item, index) => (
                <div key={index} className="item-block">
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-description">{item.description}</p>
                    <p className="item-cost">
                      {Object.entries(item.cost).map(([resource, amount]) => (
                        <span key={resource}> {resource}: {amount} </span>
                      ))}
                    </p>
                  </div>
                  <button

                    onClick={() => handleBuyItem(item, index)}  // Call handleBuyItem when the item is purchased
                    disabled={character.resources['coins'] < item.cost.coins || character.depth > 0}
                    className="shop-button"
                  >
                    {translations[language].buy}
                  </button>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'sell' && (
            <div className="sell-items">
              <h3>Inventory</h3>
              {character.inventory.length > 0 ? (
                character.inventory.filter(item => item.type === 'equipable').map((item, index) => (
                  <div key={index} className="sell-item-block">
            <p>{item.name} - Sells for {Math.floor(item.cost.coins * 0.5)} coins</p>
            <p>{item.description}</p>
            <button onClick={() => handleSellItem(item)} disabled={character.depth > 0}>Sell</button>
          </div>
                ))
              ) : (
                <p>Your inventory is empty.</p>
              )}
            </div>
          )}
          
          <div className="resources-display">
          {Object.keys(character.resources).map(resourceKey => (
    <p key={resourceKey}>
      <strong>{translations[language][resourceKey]}:</strong> {character.resources[resourceKey]}
    </p>
  ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOverlay;
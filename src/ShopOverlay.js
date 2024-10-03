import React, { useState, useEffect } from 'react';
import { buildings } from './building';
import translations from './translations';

const ShopOverlay = ({ character, setCharacter, setShopOverlayVisible }) => {
  const [activeTab, setActiveTab] = useState('conversion');  // State to manage active tab
  const [convertAmount, setConvertAmount] = useState({
    iron: 0,
    gold: 0,
    diamonds: 0,
  });  

  const initializeShopStock = () => {
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
        name: 'Rope',
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
        name: 'Chest Armor',
        type: 'equipable',
        stacks: false,
        slot: 'chest',
        description: 'Provides 5 extra armor points.',
        cost: { coins: 80 },
        bonus: { armor: 5 },
      }
    ];
  
    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (!savedShopStock) {
      localStorage.setItem('shopStock', JSON.stringify(defaultItems));
      return defaultItems;
    }
    return savedShopStock;
  };

  const [shopItems, setShopItems] = useState(initializeShopStock());  // Initialize with the shop stock

  const conversionRates = {
    iron: 1,
    gold: 5,
    diamonds: 10,
  };

  const handleSliderChange = (resource, value) => {
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: value,
    }));
  };

  useEffect(() => {
    const savedShopStock = JSON.parse(localStorage.getItem('shopStock'));
    if (savedShopStock) {
      setShopItems(savedShopStock);  // Restore the shop items from localStorage
    }
  }, []);

  const addNewItemToShop = (newItem) => {
    const updatedShopStock = [...shopItems, newItem];
    setShopItems(updatedShopStock);
    localStorage.setItem('shopStock', JSON.stringify(updatedShopStock));
  };

  // Handle max button click to set the slider to the maximum value
  const handleMaxClick = (resource) => {
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: character[resource],
    }));
  };

  const handleConvert = (resource) => {
    character.convertToCoins(resource, convertAmount[resource]);
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
  if (character.coins >= item.cost.coins) {
    if (item.type === 'consumable') {
      item.effect(character);  // Consumable is used immediately
      character.logMessage(`${item.name} used.`);
    } else {
      // Add equipable or stackable items to inventory
      character.addItemToInventory(item);
    }
    character.coins -= item.cost.coins;
    setCharacter(character);  // Update character state

    // If the item is not consumable or special, remove it from the shop stock
    if (item.type !== 'consumable' && item.type !== 'special') {
      const updatedShopStock = shopItems.filter((shopItem, i) => i !== index);
      setShopItems(updatedShopStock);
      localStorage.setItem('shopStock', JSON.stringify(updatedShopStock));  // Save updated stock to localStorage
    }
  }
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

        {/* Resource Display at the top */}
        <div className="resources-display">
          <p><strong>Coins:</strong> {character.coins}</p>
          <p><strong>Wood:</strong> {character.wood}</p>
          <p><strong>Stone:</strong> {character.stone}</p>
          <p><strong>Iron:</strong> {character.iron}</p>
          <p><strong>Gold:</strong> {character.gold}</p>
          <p><strong>Diamonds:</strong> {character.diamonds}</p>
        </div>

        {/* Tab Navigation */}
        <div className="shop-tabs">
          <button onClick={() => setActiveTab('conversion')} className={activeTab === 'conversion' ? 'active' : ''}>Convert Resources</button>
          <button onClick={() => setActiveTab('buildings')} className={activeTab === 'buildings' ? 'active' : ''}>Buy Buildings</button>
          <button onClick={() => setActiveTab('items')} className={activeTab === 'items' ? 'active' : ''}>Buy Items</button>
        </div>

        {/* Fixed Height for Tab Content */}
        <div className="tab-content">
        {activeTab === 'conversion' && (
  <div className="conversion-section">
    <h2>Convert Resources</h2>
    {['iron', 'gold', 'diamonds'].map(resource => (
      <div key={resource} className="conversion-row">
        <p>{resource.charAt(0).toUpperCase() + resource.slice(1)}: {character[resource]}</p>
        <p>Convert to {convertAmount[resource] * conversionRates[resource]} coins</p>
        <input
          type="range"
          min="0"
          max={character[resource]}
          value={convertAmount[resource]}
          onChange={(e) => handleSliderChange(resource, e.target.value)}
        />
        <span>{convertAmount[resource]}</span>

        {/* Max Button */}
        <button onClick={() => handleMaxClick(resource)} className="max-button">
          Max
        </button>

        <button onClick={() => handleConvert(resource)} disabled={convertAmount[resource] <= 0 || character.isExploring} className="shop-button">
          Convert
        </button>
      </div>
    ))}

    {/* Add Consumables here */}
    <h2>Consumables</h2>
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
            if (character.coins >= item.cost.coins) {
              // item.effect(character); // Consumable is used immediately
              character.useHealingPotion();
              character.logMessage(`${item.name} used.`);
              character.coins -= item.cost.coins;
              setCharacter(character);
            }
          }}
          disabled={character.coins < item.cost.coins}
          className="shop-button"
        >
          Buy
        </button>
      </div>
    ))}
  </div>
)}
          {activeTab === 'buildings' && (
            <div className="buildings-section">
              <h2>Buy Buildings</h2>
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
                      const resources = {
                        wood: character.wood,
                        stone: character.stone,
                        iron: character.iron,
                        coins: character.coins,
                      };
                      if (building.canAfford(resources)) {
                        character.buyBuilding(building);
                        setCharacter(character);
                      }
                    }}
                    disabled={!building.canAfford({
                      wood: character.wood,
                      stone: character.stone,
                      iron: character.iron,
                      coins: character.coins,
                    })}
                    className="shop-button"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          )}

{activeTab === 'items' && (
  <div className="items-section">
    <h2>Buy Items</h2>
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
          disabled={character.coins < item.cost.coins}
          className="shop-button"
        >
          Buy
        </button>
      </div>
    ))}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default ShopOverlay;
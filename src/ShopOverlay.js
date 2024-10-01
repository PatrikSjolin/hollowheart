import React, { useState } from 'react';
import { buildings } from './gameLogic';
import { items } from './gameLogic';  // Import the items array from gameLogic

const ShopOverlay = ({ character, setCharacter, setShopOverlayVisible }) => {

  const [convertAmount, setConvertAmount] = useState({
    iron: 0,
    gold: 0,
    diamonds: 0,
  });

  // Conversion rates for each resource
  const conversionRates = {
    iron: 1,
    gold: 5,
    diamonds: 10,
  };


  // Handle slider change for resource conversion
  const handleSliderChange = (resource, value) => {
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: value,
    }));
  };

  const handleConvert = (resource) => {
    character.convertToCoins(resource, convertAmount[resource]);
    setCharacter(character);

    // Reset slider to the new max value after conversion (remaining resource)
    setConvertAmount(prevState => ({
      ...prevState,
      [resource]: 0,  // Reset slider to 0
    }));
  };
  return (
    <div className="overlay">
      <div className="overlay-content">
        <span className="close-btn" onClick={() => setShopOverlayVisible(false)}>&times;</span> {/* Close button */}

        {/* Display resources at the top of the shop */}
        <div className="resources-display">
          <p><strong>Coins:</strong> {character.coins}</p>
          <p><strong>Wood:</strong> {character.wood}</p>
          <p><strong>Stone:</strong> {character.stone}</p>
          <p><strong>Iron:</strong> {character.iron}</p>
          <p><strong>Diamonds:</strong> {character.diamonds}</p>
        </div>
        
        {/* Conversion Section */}
        <h2>Convert Resources</h2>
        <div className="conversion-section">
          {['iron', 'gold', 'diamonds'].map(resource => (
            <div key={resource} className="conversion-row">
              <p>{resource.charAt(0).toUpperCase() + resource.slice(1)}: {character[resource]}</p>
              {/* Display "Convert to X coins" above the slider */}
              <p>Convert to {convertAmount[resource] * conversionRates[resource]} coins</p>
              <input
                type="range"
                min="0"
                max={character[resource]}
                value={convertAmount[resource]}
                onChange={(e) => handleSliderChange(resource, e.target.value)}
              />
              <span>{convertAmount[resource]}</span>
              <button onClick={() => handleConvert(resource)} disabled={convertAmount[resource] <= 0 || character.isExploring} className="shop-button">
                Convert
              </button>
            </div>
          ))}
        </div>

        <h2>Buy Buildings</h2>
        {buildings.filter((building) => building.isUnlocked(character)).map((building, index) => (
          <div key={index} className="building-block">
            <div className="building-info">
              <p className="building-name">{building.name}</p>
              <p className="building-description">{building.description}</p>  {/* Displaying the description */}
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

        {/* Buy Items Section */}
        <h2>Buy Items</h2>
        {items.map((item, index) => (
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
                  item.effect(character);
                  setCharacter(character);
                }
              }}
              disabled={character.isExploring || character.coins < item.cost.coins}
              className="shop-button"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopOverlay;

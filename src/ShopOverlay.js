import React from 'react';
import { buildings } from './gameLogic';

const ShopOverlay = ({ character, setCharacter, setShopOverlayVisible }) => (

  <div className="overlay">
    <div className="overlay-content">
      <span className="close-btn" onClick={() => setShopOverlayVisible(false)}>&times;</span> {/* Close button */}
      <h2>Shop</h2>
      <p>Convert resources to coins or purchase buildings.</p>
      <div>
        <p>Iron: {character.iron} (Converts to {character.iron * 1} Coins)</p>
        <button onClick={() => character.convertToCoins('iron')} disabled={character.isExploring} className="shop-button">Convert Iron</button>
        <p>Gold: {character.gold} (Converts to {character.gold * 5} Coins)</p>
        <button onClick={() => character.convertToCoins('gold')} disabled={character.isExploring} className="shop-button">Convert Gold</button>
        <p>Diamonds: {character.diamonds} (Converts to {character.diamonds * 10} Coins)</p>
        <button onClick={() => character.convertToCoins('diamonds')} disabled={character.isExploring} className="shop-button">Convert Diamonds</button>
      </div>

      <h3>Buy Buildings</h3>
      {buildings.map((building, index) => (
        <div key={index} className="building-block">
          <p className="building-name">{building.name}</p>
          <p className="building-cost">
            {Object.entries(building.cost).map(([resource, amount]) => (
              <span key={resource}> {resource}: {amount} </span>
            ))}
          </p>
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

      <h3>Buy Items</h3>
      <button onClick={() => { character.useHealingPotion(); setCharacter(character); }} disabled={character.isExploring} className="shop-button">Buy Health Potion (+100 hp) (10 Coins)</button>
    </div>
  </div>
);

export default ShopOverlay;

import React from 'react';

const ShopOverlay = ({ character, setCharacter, setShopOverlayVisible }) => (
  <div className="overlay">
    <div className="overlay-content">
      <span className="close-btn" onClick={() => setShopOverlayVisible(false)}>&times;</span> {/* Close button */}
      <h2>Shop</h2>
      <p>Convert resources to coins or purchase buildings.</p>
      <div>
        <p>Iron: {character.iron} (Converts to {character.iron * 1} Coins)</p>
        <button onClick={() => character.convertToCoins('iron')}>Convert Iron</button>
        <p>Gold: {character.gold} (Converts to {character.gold * 5} Coins)</p>
        <button onClick={() => character.convertToCoins('gold')}>Convert Gold</button>
        <p>Diamonds: {character.diamonds} (Converts to {character.diamonds * 10} Coins)</p>
        <button onClick={() => character.convertToCoins('diamonds')}>Convert Diamonds</button>
      </div>
      <h3>Buy Buildings</h3>
      <button onClick={() => {
        character.buyBuilding('wood');
        setCharacter({ ...character });
      }}>Buy Wood Generator (100 Coins)</button>

      <button onClick={() => {
        character.buyBuilding('stone');
        setCharacter({ ...character });
      }}>Buy Stone Generator (150 Coins)</button>
    </div>
  </div>
);

export default ShopOverlay;

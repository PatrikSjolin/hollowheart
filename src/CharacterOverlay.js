import React, { useEffect } from 'react';
import { debug } from './App';
import translations from './translations';

const CharacterOverlay = ({ character, setCharacter, setCharacterOverlayVisible, language }) => {

  // Close the overlay when clicking outside the overlay content
  const handleClickOutside = (e) => {
    if (e.target.classList.contains('overlay')) {
      setCharacterOverlayVisible(false);
    }
  };

  // Close the overlay when pressing Escape
  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      setCharacterOverlayVisible(false);
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
        <span className="close-btn" onClick={() => setCharacterOverlayVisible(false)}>&times;</span>
        <h2>Character Stats</h2>

        <div className="stat-row">
          <p><strong>{translations[language].strength}:</strong> {character.strength}</p>
          <p>Improves armor and survivability</p>
          <button
            onClick={() => {
              character.upgradeStat('strength');
              setCharacter(character);
            }}
            disabled={character.unallocatedPoints <= 0}
            className="plus-button"
          >
            +
          </button>
        </div>

        <div className="stat-row">
          <p><strong>Dexterity:</strong> {character.dexterity}</p>
          <p>Improves nothing</p>
          <button
            onClick={() => {
              character.upgradeStat('dexterity');
              setCharacter(character);
            }}
            disabled={character.unallocatedPoints <= 0}
            className="plus-button"
          >
            +
          </button>
        </div>

        <div className="stat-row">
          <p><strong>Vitality:</strong> {character.vitality}</p>
          <p>Increases maximum health</p>
          <button
            onClick={() => {
              character.upgradeStat('vitality');
              setCharacter(character);
            }}
            disabled={character.unallocatedPoints <= 0}
            className="plus-button"
          >
            +
          </button>
        </div>

        <div className="stat-row">
          <p><strong>Intelligence:</strong> {character.intelligence}</p>
          <p>Increases experience and resources gained</p>
          <button
            onClick={() => {
              character.upgradeStat('intelligence');
              setCharacter(character);
            }}
            disabled={character.unallocatedPoints <= 0}
            className="plus-button"
          >
            +
          </button>
        </div>

        <p><strong>Unallocated Stat Points:</strong> {character.unallocatedPoints}</p>


        <h3>Equipped Items</h3>
        <div className="equipped-items">
          <p><strong>Weapon:</strong> {character.equipment.weapon ? character.equipment.weapon.name : 'None'}
            {character.equipment.weapon && (
              <button onClick={() => {
                character.unequipItem('weapon');
                setCharacter(character);
              }}>
                Unequip
              </button>
            )}
          </p>
          <p><strong>Chest Armor:</strong> {character.equipment.chest ? character.equipment.chest.name : 'None'}
            {character.equipment.chest && (
              <button onClick={() => {
                character.unequipItem('chest');
                setCharacter(character);
              }}>
                Unequip
              </button>
            )}
          </p>
          <p><strong>Boots:</strong> {character.equipment.boots ? character.equipment.boots.name : 'None'}
            {character.equipment.boots && (
              <button onClick={() => {
                character.unequipItem('boots');
                setCharacter(character);
              }}>
                Unequip
              </button>
            )}
          </p>
          <p><strong>Gloves:</strong> {character.equipment.gloves ? character.equipment.gloves.name : 'None'}
            {character.equipment.gloves && (
              <button onClick={() => {
                character.unequipItem('gloves');
                setCharacter(character);
              }}>
                Unequip
              </button>
            )}
          </p>
        </div>

        {/* <h3>Inventory</h3> */}
        <h3>Inventory</h3>
        <div className="inventory-items">
  {character.inventory.length > 0 ? character.inventory.map((item, index) => (
    <div key={index} className="item-block">
      <div className="item-info">
        <p className="item-name">{item.name} {item.stacks ? `x${item.quantity}` : ''}</p>
        {item.description && (
          <p className="item-description">{item.description}</p>  // Show description if available
        )}
      </div>
      
      {/* Render equip button for equippable items */}
      {item.type === 'equipable' && (
        <button
          onClick={() => character.equipItem(item.slot, item)}
          className="equip-button"
        >
          Equip
        </button>
      )}
    </div>
  )) : <p>No items in inventory</p>}
</div>


        {debug && (<p>Experience: {character.experience} / {Math.floor(200 * Math.pow(1.5, character.level - 1))} </p>)}
        {debug && (<p>Amor: {character.calculateArmor()} - Reduction: {character.calculateDamageReductionFromArmor()} </p>)}
        {debug && (<p>Quantity gain: {character.calculateQuantityBoostFromIntelligence()} - Xp gain: {character.calculateXpBoostFromIntelligence()} </p>)}
      </div>
    </div>
  )
};

export default CharacterOverlay;

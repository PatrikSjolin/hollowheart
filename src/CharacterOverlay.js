import React from 'react';
import { debug } from './App';

const CharacterOverlay = ({ character, setCharacter, setCharacterOverlayVisible }) => (
  <div className="overlay">
    <div className="overlay-content">
      <span className="close-btn" onClick={() => setCharacterOverlayVisible(false)}>&times;</span>
      <h2>Character Stats</h2>
      
      <div className="stat-row">
        <p><strong>Strength:</strong> {character.strength}</p>
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
      {debug && (<p>Experience: {character.experience} / {Math.floor(200 * Math.pow(1.5, character.level - 1))} </p>)}
      {debug && (<p>Amor: {character.calculateArmor()} - Reduction: {character.calculateDamageReductionFromArmor()} </p>)}
      {debug && (<p>Quantity gain: {character.calculateQuantityBoostFromIntelligence()} - Xp gain: {character.calculateXpBoostFromIntelligence()} </p>)}
    </div>
  </div>
);

export default CharacterOverlay;

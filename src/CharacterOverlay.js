import React from 'react';

const CharacterOverlay = ({ character, setCharacter, setCharacterOverlayVisible }) => (
  <div className="overlay">
    <div className="overlay-content">
      <span className="close-btn" onClick={() => setCharacterOverlayVisible(false)}>&times;</span>
      <h2>Character Stats</h2>
      <p><strong>Level:</strong> {character.level}</p>
      <p><strong>Strength:</strong> {character.strength}</p>
      <p><strong>Dexterity:</strong> {character.dexterity}</p>
      <p><strong>Vitality:</strong> {character.vitality}</p>
      <p><strong>Intelligence:</strong> {character.intelligence}</p>
      <p><strong>Unallocated Stat Points:</strong> {character.unallocatedPoints}</p>
      <div>
        <button onClick={() => {
          character.upgradeStat('strength');
          setCharacter({ ...character });
        }}>Upgrade Strength</button>
        <button onClick={() => {
          character.upgradeStat('dexterity');
          setCharacter({ ...character });
        }}>Upgrade Dexterity</button>
        <button onClick={() => {
          character.upgradeStat('vitality');
          setCharacter({ ...character });
        }}>Upgrade Vitality</button>
        <button onClick={() => {
          character.upgradeStat('intelligence');
          setCharacter({ ...character });
        }}>Upgrade Intelligence</button>
      </div>
    </div>
  </div>
);

export default CharacterOverlay;

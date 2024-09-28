import React, { useState, useEffect } from 'react';
import ShopOverlay from './ShopOverlay';
import CharacterOverlay from './CharacterOverlay';
import { Character } from './gameLogic'; // Import character logic

import './App.css'; // Use existing styles from your CSS

const App = () => {
  const [character, setCharacter] = useState(null); // Initialize as null to avoid premature access
  const [log, setLog] = useState([]);
  const [firstTimeOverlayVisible, setFirstTimeOverlayVisible] = useState(true);
  const [shopOverlayVisible, setShopOverlayVisible] = useState(false); // Shop visibility state
  const [characterOverlayVisible, setCharacterOverlayVisible] = useState(false); // Character overlay visibility state

  // Logging function
  const logMessage = (message) => {
    setLog((prevLog) => [...prevLog, message]);
  };

  const [playerName, setPlayerName] = useState(""); // Add player name state

    // Load character state from localStorage when the app first loads
    useEffect(() => {
      const savedCharacter = localStorage.getItem('characterState');
      if (savedCharacter) {
        const parsedCharacter = JSON.parse(savedCharacter);
        setCharacter(new Character(setCharacter, logMessage, parsedCharacter)); // Load character from storage
      } else {
        const newCharacter = new Character(setCharacter, logMessage); // Create new character if none exists
        setCharacter(newCharacter);
      }
    }, []); // Empty dependency array ensures this runs only once, on mount
  
    // Save character state to localStorage whenever it changes
    useEffect(() => {
      if (character) {
        localStorage.setItem('characterState', JSON.stringify(character));
      }
    }, [character]); // This runs whenever the character state updates
  
    // Guard clause to prevent rendering before character is initialized
    if (!character) return <div>Loading...</div>;

  const startGame = (name) => {
    character.playerName = name;
    setFirstTimeOverlayVisible(false);
    logMessage(`Welcome, ${name}. Prepare for a dangerous descent into Hollowheart.`);
  };

  const toggleOverlay = (setter) => setter((prev) => !prev); // Toggles the given overlay's visibility state

  return (
    <div className="container">
      <h1>Hollowheart</h1>
      <p>Current Depth: {character.depth}</p>
      <div className="health-bar-container">
        <p>Health: {character.currentHealth} / {character.health}</p>
        <div className="health-bar">
          <div id="healthBarFill" style={{ width: `${(character.currentHealth / character.health) * 100}%` }}></div>
        </div>
      </div>
      <p>Iron: {character.iron}</p>
      <p>Gold: {character.gold}</p>
      <p>Diamonds: {character.diamonds}</p>
      <p>Coins: {character.coins}</p>

      <button className="character-btn" onClick={() => toggleOverlay(setCharacterOverlayVisible)}>
  Character Stats
</button>

<button className="explore-btn" onClick={() => toggleOverlay(setShopOverlayVisible)}>
  Open Shop
</button>

      <button className="explore-btn" onClick={() => character.startExploring()}>Descend into the Hole</button>
      <button className="explore-btn" onClick={() => character.ascend()}>Ascend</button>

      <div id="log">
        {log.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>

      {characterOverlayVisible && (
  <CharacterOverlay 
    character={character} 
    setCharacter={setCharacter} 
    setCharacterOverlayVisible={setCharacterOverlayVisible} 
  />
)}

{shopOverlayVisible && (
  <ShopOverlay 
    character={character} 
    setCharacter={setCharacter} 
    setShopOverlayVisible={setShopOverlayVisible} 
  />
)}



{firstTimeOverlayVisible && (
  <div className="overlay">
    <div className="overlay-content">
      <h2>Welcome to Hollowheart</h2>
      <p>A mysterious hole has appeared beside your village, plaguing and poisoning the land. Brave souls have ventured into its depths, never to return.</p>
      <p>Now it's your turn. Will you survive the descent?</p>
      <p>This is a dangerous and unforgiving journey. Only the strongest and most resilient will make it out alive.</p>
      <input 
        type="text" 
        placeholder="Your name" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)} 
      />
      <button onClick={() => startGame(playerName)}>Start Game</button> {/* Add Start Button */}
    </div>
  </div>
)}
    </div>
  );
};

export default App;

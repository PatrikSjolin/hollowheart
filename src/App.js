import React, { useState, useEffect } from 'react';
import ShopOverlay from './ShopOverlay';
import CharacterOverlay from './CharacterOverlay';
import { Character } from './gameLogic'; // Import character logic

import './App.css'; // Use existing styles from your CSS

// Define saveToLocalStorage function to be used across the app
const saveToLocalStorage = (character) => {
  console.log("Saving character to localStorage:", character);
  localStorage.setItem('characterState', JSON.stringify(character));
};

const App = () => {
  const [character, setCharacter] = useState(null); // Initialize as null to avoid premature access
  const [log, setLog] = useState([]);
  const [firstTimeOverlayVisible, setFirstTimeOverlayVisible] = useState(true);
  const [shopOverlayVisible, setShopOverlayVisible] = useState(false); // Shop visibility state
  const [characterOverlayVisible, setCharacterOverlayVisible] = useState(false); // Character overlay visibility state

  // Logging function
  const logMessage = (message) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `[${hours}:${minutes}:${seconds}] `;

    setLog((prevLog) => [...prevLog, `${timestamp}${message}`]);
  };

  const [playerName, setPlayerName] = useState(""); // Add player name state

  // Load character state from localStorage when the app first loads
  useEffect(() => {
    const savedCharacter = localStorage.getItem('characterState');
    console.log("Loading character:", character);
    if (savedCharacter) {
      const parsedCharacter = JSON.parse(savedCharacter);
      setFirstTimeOverlayVisible(false); // Hide intro if character exists
      setCharacter(new Character(saveToLocalStorage, logMessage, parsedCharacter,)); // Load character from storage
    } else {
      const newCharacter = new Character(saveToLocalStorage, logMessage); // Create new character if none exists
      setCharacter(newCharacter);
    }
  }, []);

  // Game loop to handle resource gathering, life regen, exploration, hazards
  useEffect(() => {
    if (character) {
      let lastTimestamp = Date.now(); // Keep track of the last loop tick
      const gameLoop = setInterval(() => {

        const currentTimestamp = Date.now();
        const elapsedTime = (currentTimestamp - lastTimestamp) / 1000; // Convert to seconds
        lastTimestamp = currentTimestamp;

        // Life regeneration
        character.regenerateHealth(elapsedTime);

        // Resource gathering (e.g., from buildings)
        character.generateResources(elapsedTime);

        // Exploration and hazard checks
        character.checkExplorationProgress(elapsedTime);  // Explore and handle hazards

        // Update character and save to localStorage
        setCharacter(character);
        saveToLocalStorage(character);
      }, 1000); // Game loop runs every 1 second

      return () => clearInterval(gameLoop); // Cleanup on component unmount
    }
  }, [character]);

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
      <p>Stone: {character.stone}</p>
      <p>Wood: {character.wood}</p>

      <button className="character-btn" onClick={() => toggleOverlay(setCharacterOverlayVisible)}>
        Character Stats
      </button>

      <button className="explore-btn" onClick={() => toggleOverlay(setShopOverlayVisible)}>
        Open Shop
      </button>

      <button className="explore-btn" onClick={() => character.startExploring()}>Descend into the Hole</button>
      <button className="explore-btn" onClick={() => character.ascend()}>Ascend</button>

      <div id="log">
        <section className="log-section">
          {log.slice(0).reverse().map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </section>
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

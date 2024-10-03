import React, { useState, useEffect } from 'react';
import ShopOverlay from './ShopOverlay';
import CharacterOverlay from './CharacterOverlay';
import ResearchOverlay from './ResearchOverlay';  // Add this line
import { Character } from './gameLogic'; // Import character logic
import MessageOverlay from './MessageOverlay';
import translations from './translations'; // Import translations

import './App.css'; // Use existing styles from your CSS

export const apiUrl = 'https://23ab-2001-9b1-4500-ef00-a4e3-da53-a84b-f3be.ngrok-free.app';
export const debug = false;

const gameVersion = '0.0.2';

// Define saveToLocalStorage function to be used across the app
const saveToLocalStorage = (character) => {
  console.log("Saving character to localStorage:", character);
  localStorage.setItem('characterState', JSON.stringify(character));
};

const App = () => {
  const [language, setLanguage] = useState(() => {
    // Load language from localStorage, default to 'en'
    const savedSettings = JSON.parse(localStorage.getItem('siteSettings'));
    return savedSettings?.language || 'en';
  });

  // Handle language change
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  // Save the selected language in localStorage when it changes
  useEffect(() => {
    const siteSettings = { language };
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
  }, [language]);


  const [character, setCharacter] = useState(null); // Initialize as null to avoid premature access
  const [log, setLog] = useState([]);
  const [firstTimeOverlayVisible, setFirstTimeOverlayVisible] = useState(true);
  const [shopOverlayVisible, setShopOverlayVisible] = useState(false); // Shop visibility state
  const [characterOverlayVisible, setCharacterOverlayVisible] = useState(false); // Character overlay visibility state
  const [researchOverlayVisible, setResearchOverlayVisible] = useState(false); // Character overlay visibility state
  const [generalMessage, setGeneralMessage] = useState(null);
  const [playerName, setPlayerName] = useState(""); // Add player name state
  const [highScores, setHighScores] = useState([]);

  // Logging function
  const logMessage = (message) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `[${hours}:${minutes}:${seconds}] `;

    setLog((prevLog) => [...prevLog, `${timestamp}${message}`]);
  };

  useEffect(() => {
    fetch(apiUrl + '/highscores', {
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
    })  // Replace with your server URL
      .then(response => response.json())
      .then(data => setHighScores(data))
      .catch(error => console.error('Error fetching high scores:', error));
  }, []);  // Empty array to ensure this only runs once on component mount

  useEffect(() => {
    const interval = setInterval(() => {
      if (character && character.ongoingResearch && character.getResearchProgress() > 0) {
        setCharacter(character); // Trigger state update to reflect progress
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [character, setCharacter]);

  // Load character state from localStorage when the app first loads
  useEffect(() => {
    const savedCharacter = localStorage.getItem('characterState');
    console.log("Loading character:", character);
    if (savedCharacter) {
      const parsedCharacter = JSON.parse(savedCharacter);
      setFirstTimeOverlayVisible(false); // Hide intro if character exists
      setCharacter(new Character(saveToLocalStorage, logMessage, setGeneralMessage, setHighScores, parsedCharacter)); // Load character from storage
    } else {
      const newCharacter = new Character(saveToLocalStorage, logMessage, setGeneralMessage, setHighScores); // Create new character if none exists
      setCharacter(newCharacter);
    }
  }, []);

  const [researchTimers, setResearchTimers] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (character && character.ongoingResearch && character.getResearchProgress() > 0) {
        setResearchTimers(character.getResearchProgress()); // Update the research timers
        setCharacter(character); // Update character state
      } else if (character && character.ongoingResearch && character.getResearchProgress() === 0) {
        character.completeResearch(); // Complete the research
        setCharacter(character);
        setResearchTimers(null); // Clear the timers after completion
      }
    }, 1000); // Check every second

    return () => clearInterval(interval); // Clean up on component unmount
  }, [character, setCharacter]);


  // Game loop to handle resource gathering, life regen, exploration, hazards
  useEffect(() => {
    if (character && !firstTimeOverlayVisible) {  // Ensure the loop only starts after the player has clicked Start
      let lastTimestamp = Date.now(); // Keep track of the last loop tick
      const gameLoop = setInterval(() => {
        const currentTimestamp = Date.now();
        const elapsedTime = currentTimestamp - lastTimestamp;
        lastTimestamp = currentTimestamp;

        // Life regeneration
        character.regenerateHealth(elapsedTime);

        // Resource gathering (e.g., from buildings)
        character.generateResources(elapsedTime);

        // Exploration and hazard checks
        character.explore(elapsedTime);

        // Update character and save to localStorage
        setCharacter(character);
        saveToLocalStorage(character);
      }, 500); // Game loop runs every 1 second

      return () => clearInterval(gameLoop); // Cleanup on component unmount
    }
  }, [character, firstTimeOverlayVisible]);  // Now the loop only starts after the overlay is hidden


  // Guard clause to prevent rendering before character is initialized
  if (character === null && !firstTimeOverlayVisible) {
    return <div>Loading...</div>;
  }

  const startGame = (name) => {
    console.log("starting game");
    if (character === null) {
      // Create a new character and set playerName to the entered name
      const newCharacter = new Character(saveToLocalStorage, logMessage, showGeneralMessage, setHighScores, { playerName: name });
      setCharacter(newCharacter);
    } else {
      // Update the name if the character already exists
      character.playerName = name;
      setCharacter(character);
    }

    setFirstTimeOverlayVisible(false);  // Hide the overlay
    // startMusic();
    logMessage(`Welcome, ${name}. Prepare for a dangerous descent into Hollowheart.`);
  };


  // Function to reset the game and show the first overlay again
  const resetGame = () => {
    // Show a confirmation prompt to the user before proceeding
    const confirmReset = window.confirm("Are you sure you want to give up? All progress will be lost.");
    if (confirmReset) {
      // Clear character data and reset the state
      setCharacter(null);
      setFirstTimeOverlayVisible(true);
      localStorage.removeItem('characterState');  // Clear saved character in localStorage
      setLog([]);  // Clear the log
      console.clear();
    }
  };

  const getBuildingCounts = (buildings) => {
    const buildingCounts = {};
    buildings.forEach((building) => {
      if (!buildingCounts[building.name]) {
        buildingCounts[building.name] = 1;
      } else {
        buildingCounts[building.name]++;
      }
    });
    return buildingCounts;

  };

  const showGeneralMessage = (title, message) => {
    setGeneralMessage({ title, message });
  };

  const handleClimbUp = () => {
    character.climbUp();
    setCharacter(character);
  };

  return (
    <div className="container">
      <h1>{translations[language].title}</h1>
      {/* Character Name and Level Section */}
      {character && (
        <section className="character-info">
          <p>{character.playerName}</p>
          <p className={`level-text ${character.isLevelingUp ? 'level-up-glow' : ''}`}>
            Level: {character.level}
          </p>
        </section>
      )}

      {character && (
        <p>Current Depth: {character.depth}</p>
      )}

      {character && (
        <section className="health-section">
          <div className="health-bar-container">
            <div className="health-bar">
              <div id="healthBarFill" style={{ width: `${(character.currentHealth / character.calculateMaxHealth()) * 100}%` }}></div>
              <div className="health-text">
                Health: {character.currentHealth} / {character.calculateMaxHealth()}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Resources Section */}
      {character && (
        <section className="resources-section">
          <p>{translations[language].iron}: {character.iron}</p>
          <p>{translations[language].gold}: {character.gold}</p>
          <p>{translations[language].diamonds}: {character.diamonds}</p>
          <p>{translations[language].coins}: {character.coins}</p>
          <p>{translations[language].wood}: {character.wood} / {character.maxWood}</p>
          <p>{translations[language].stone}: {character.stone} / {character.maxStone}</p>
        </section>
      )}

      {/* Buildings Section */}
      {character && character.buildings.length > 0 && (
        <section className="buildings-section">
          <h3>Owned Buildings:</h3>
          {Object.entries(getBuildingCounts(character.buildings)).map(([name, count], index) => (
            <p key={index}>{name} x{count}</p>
          ))}
        </section>
      )}
      {/* Display ongoing research under buildings */}
      {character && character.ongoingResearch && (
        <div className="research-progress">
          <p>Ongoing Research: {character.ongoingResearch.name}</p>
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${((character.ongoingResearch.timeRequired - character.getResearchProgress()) / character.ongoingResearch.timeRequired) * 100}%`
              }}
            ></div>
          </div>
        </div>

      )}
      {/* Action Buttons */}
      {character && (
        <section className="actions-section">
          <button className="explore-btn" onClick={() => character.startExploring()}>
            {'Descend ↓'}
          </button>
          <button
            className={`explore-btn ${!character.isExploring ? 'disabled' : ''}`}
            onClick={() => {
              if (character.isExploring) character.ascend();
            }}
            disabled={!character.isExploring}
          >
            Ascend ↑
          </button>
          <button
  onClick={handleClimbUp}
  disabled={
    !character.inventory.some(item => item.name === 'Rope' && item.quantity > 0) || character.depth === 0 || character.depth === 1
  }
>
  ⬆️
</button>

          <button className={`character-stats-button ${character.isLevelingUp ? 'glow' : ''}`} onClick={() => setCharacterOverlayVisible(true)}>
            {translations[language].character}
          </button>
          <button className="shop-btn" onClick={() => setShopOverlayVisible(!shopOverlayVisible)}>Shop</button>

          {character.libraryBuilt && (
            <button className="character-btn" onClick={() => setResearchOverlayVisible(true)}>Research</button>
          )}

          {researchOverlayVisible && (
            <ResearchOverlay
              character={character}
              setCharacter={setCharacter}
              setResearchOverlayVisible={setResearchOverlayVisible}
              researchTimers={researchTimers}
            />
          )}

          {/* Give Up Button */}
          <button className="give-up-btn" onClick={resetGame}>{translations[language].giveUp}</button>
          {/* Debug button */}
          {debug && (<button className="debug-btn" onClick={() => {
            character.addDebugResources();
            setCharacter(character);
          }}>
            Debug: Add Resources
          </button>)}
        </section>
      )}
      {/* Log Section */}
      <section className="log-section">
        {log.slice(0).reverse().map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </section>

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

      {generalMessage && (
        <MessageOverlay
          title={generalMessage.title}
          message={generalMessage.message}
          onClose={() => setGeneralMessage(null)}
        />
      )}
      {firstTimeOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Welcome to Hollowheart</h2>
            <p>{translations[language].welcomeMessage1}</p>
            <p>{translations[language].welcomeMessage2}</p>
            <p>{translations[language].welcomeMessage3}</p>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              autoFocus
              className="name-input"
            />
            <button onClick={() => startGame(playerName)}>Start Game</button> {/* Add Start Button */}
          </div>
        </div>
      )}
      {/* Language Dropdown */}
      <div className="language-dropdown">
        <label htmlFor="language">Language: </label>
        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="en">{translations[language].english}</option>
          <option value="sv">{translations[language].swedish}</option>
        </select>
      </div>

      {/* Sun Element */}
      {character && (
        <div
          id="sun"
          style={{
            backgroundColor: `rgba(255, 223, 0, ${Math.max(1 - character.depth * 0.1, 0.05)})`,
            boxShadow: `0 0 30px rgba(255, 223, 0, ${0.8 - character.depth * 0.1})`
          }}
        ></div>
      )}

      <div className="game-version">
        Version: {gameVersion}
      </div>
      <div className="highscore-display">
        <h3>{translations[language].highScores}</h3>
        {highScores.map((score, index) => (
          <p key={`score-${index}`}>{index + 1}. {score.characterName}: {score.score}</p>
        ))}
      </div>

    </div>
  );
};

export default App;

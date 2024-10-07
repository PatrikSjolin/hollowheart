import React, { useState, useEffect, useRef } from 'react';
import ShopOverlay from './ShopOverlay';
import CharacterOverlay from './CharacterOverlay';
import ResearchOverlay from './ResearchOverlay';  // Add this line
import { Character } from './Character'; // Import character logic
import MessageOverlay from './MessageOverlay';
import translations from './translations'; // Import translations
import { HighscoreService } from './HighScoreService'; // Import the service
import { ShopService } from './ShopService';
import { Item } from './item';
import { Game } from './Game';  // Import the new Game class

import './App.css'; // Use existing styles from your CSS

export const debug = process.env.REACT_APP_DEBUG === 'true';

const gameVersion = '0.0.3';

const App = () => {

  const [language, setLanguage] = useState(() => {
    // Load language from localStorage, default to 'en'
    const savedSettings = JSON.parse(localStorage.getItem('siteSettings'));
    return savedSettings?.language || 'en';
  });
  const [stars, setStars] = useState([]);  // Store star positions in state
  const [starColors, setStarColors] = useState([]);  // Store colors of the stars

  useEffect(() => {
    // Generate stars only once when the component mounts
    setStars(generateStars(100));
  }, []);  // Empty dependency array ensures this runs only once

  // Define saveToLocalStorage function to be used across the app
  const saveToLocalStorage = (character) => {
    console.log("Saving character to localStorage:", character);
    localStorage.setItem('characterState', JSON.stringify(character));
  };

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
  const [game, setGame] = useState(null);  // Initialize game state
  const [log, setLog] = useState([]);
  const [firstTimeOverlayVisible, setFirstTimeOverlayVisible] = useState(true);
  const [shopOverlayVisible, setShopOverlayVisible] = useState(false); // Shop visibility state
  const [characterOverlayVisible, setCharacterOverlayVisible] = useState(false); // Character overlay visibility state
  const [researchOverlayVisible, setResearchOverlayVisible] = useState(false); // Character overlay visibility state
  const [generalMessage, setGeneralMessage] = useState(null);
  const [playerName, setPlayerName] = useState(""); // Add player name state
  const [highScores, setHighScores] = useState([]);
  const [shopItems, setShopItems] = useState(ShopService.initializeShopStock());  // Move the shop items to App.js
  const logRef = useRef(null);  // Add this line to define logRef

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);  // This will trigger auto-scrolling whenever the log updates

  // Logging function
  const logMessage = (message) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `[${hours}:${minutes}:${seconds}] `;

    setLog((prevLog) => [...prevLog, `${timestamp}${message}`]);
  };

  // Function to fetch high scores and update the state
  const fetchHighScores = () => {
    HighscoreService.fetchHighscores()
      .then(data => setHighScores(data))
      .catch(error => console.error('Error fetching high scores:', error));
  };

  // useEffect to fetch high scores on component mount
  useEffect(() => {
    fetchHighScores(); // Fetch high scores when the component is mounted
  }, []);

  // Function to handle sending the high score and refetching scores
  const submitHighScore = (characterName, recordDepth) => {
    HighscoreService.sendHighscore(characterName, recordDepth)
      .then(() => fetchHighScores()) // Fetch updated high scores after submission
      .catch(error => console.error('Error updating high scores:', error));
  };

  // This useEffect can watch for depth changes and submit high score when necessary
  useEffect(() => {
    if (character) {
      if (character.depth > character.recordDepth) {
        character.recordDepth = character.depth;  // Update the record
        submitHighScore(character.playerName, character.depth);
        if (character.depth === 5) {
          const newItem = {
            name: 'Dung-induced boots',
            type: 'equipable',
            slot: 'boots',
            description: 'They stink. But increases armor by 20',
            cost: { coins: 400 },
            bonus: { armor: 20 },
          };
          ShopService.addNewItemToShop(newItem, shopItems, setShopItems);  // Call the function passed from App.js
        }
      }
    }
  }, [character?.depth]);  // Still track changes in depth


  useEffect(() => {
    const interval = setInterval(() => {
      if (character && character.ongoingResearch && character.getResearchProgress() > 0) {
        setCharacter(character); // Trigger state update to reflect progress
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [character, setCharacter]);

  useEffect(() => {
    if (character && character.depth !== undefined) {
      console.log(character.depth);
      const colors = getStarColors(character.depth);
      setStarColors(colors);  // Update the star colors when the depth changes
    }
  }, [character?.depth]);  // Track changes in character

  // Load character state from localStorage when the app first loads
  useEffect(() => {
    const savedCharacter = localStorage.getItem('characterState');
    console.log("Loading character:", character);
    if (savedCharacter) {
      const parsedCharacter = JSON.parse(savedCharacter);
      setFirstTimeOverlayVisible(false); // Hide intro if character exists
      
      const newCharacter = new Character(saveToLocalStorage, logMessage, setGeneralMessage, setHighScores, parsedCharacter);
      const newGame = new Game(newCharacter, logMessage, saveToLocalStorage);
      newCharacter.currentMonsters = newGame.rehydrateMonsters(newCharacter.currentMonsters);
      setGame(newGame);
      setCharacter(newCharacter); // Load character from storage
      if(debug) {
        logMessage('DEBUG: UseEffect savedCharacter is set');
      }
    } else {
      if(debug) {
      logMessage('DEBUG: UseEffect savedCharacter is not set');
      }
      const newCharacter = new Character(saveToLocalStorage, logMessage, setGeneralMessage, setHighScores); // Create new character if none exists
      setGame(new Game(newCharacter, logMessage, saveToLocalStorage));
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

        character.regenerateHealth(elapsedTime);
        character.generateResources(elapsedTime);
        game.explore(elapsedTime);
        game.handleGlobalHazards(elapsedTime);

        setCharacter(character);
        saveToLocalStorage(character);
      }, 500); // Game loop runs every 500 ms

      return () => clearInterval(gameLoop); // Cleanup on component unmount
    }
  }, [character, firstTimeOverlayVisible]);  // Now the loop only starts after the overlay is hidden


  // Guard clause to prevent rendering before character is initialized
  if (character === null && !firstTimeOverlayVisible) {
    return <div>Loading...</div>;
  }

  const startGame = (name) => {
    if (character === null) {
      // Create a new character and set playerName to the entered name
      const newCharacter = new Character(saveToLocalStorage, logMessage, showGeneralMessage, setHighScores, { playerName: name });
      if(debug) {
        logMessage('DEBUG: StartGame character == null');
      }
      setCharacter(newCharacter);
      let newGame = new Game(newCharacter, logMessage, saveToLocalStorage);
      setGame(newGame);
    } else {
      // Update the name if the character already exists
      if(debug) {
        logMessage('DEBUG: StartGame character != null');
      }
      character.playerName = name;
      setCharacter(character);
      setGame(new Game(character, logMessage, saveToLocalStorage));
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

      // Reset the shop items to default
      // const defaultItems = initializeShopStock();
      // setShopItems(defaultItems);  // Reset the shop state
      localStorage.removeItem('shopStock');
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
    game.climbUp();
    setCharacter(character);
  };

  const getStarColors = (depth) => {
    if (depth >= 1 && depth <= 4) {
      return ['#A0522D', '#8B4513', '#D2691E']; // Brown-themed stars
    } else if (depth >= 5 && depth <= 9) {
      return ['#FF4500', '#DC143C', '#B22222']; // Red-themed stars
    } else if (depth >= 10 && depth <= 19) {
      return ['#4682B4', '#5F9EA0', '#1E90FF']; // Blue-themed stars
    } else if (depth >= 20 && depth <= 29) {
      return ['#8A2BE2', '#9400D3', '#9932CC']; // Purple-themed stars
    }
    // More intervals can be added here
    return ['#ffffff']; // Default white for other depths
  };

  const generateStars = (numStars) => {
    const newStars = [];
    for (let i = 0; i < numStars; i++) {
      const size = Math.random() * 8 + 1; // Random size for each star
      const top = Math.random() * 98 + 1 + '%'; // Random top position
      const left = Math.random() * 98 + 1 + '%'; // Random left position
      newStars.push({ top, left, size });
    }
    return newStars;
  };

  const generateRandomItem = () => {
    const newItem = Item.generateItem(character.lastDepthVisited, character.level, character.intelligence);
    logMessage(newItem.name);
    character.addItemToInventory(newItem);
    setCharacter(character);
    saveToLocalStorage(character);
  };

  const increaseCharacterLevel = () => {
    character.levelUp();
    setCharacter(character);
    saveToLocalStorage(character);
  };

  return (

    <div className="container">
      <div id="star-container">
        {stars.map((star, index) => (
          <div
            key={index}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              backgroundColor: starColors[Math.floor(Math.random() * starColors.length)],
            }}
          ></div>
        ))}
      </div>
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
        <p>{translations[language].currentDepth}: {character.depth} / {character.lastDepthVisited}</p>
      )}

      {character && (
        <section className="health-section">
          <div className="health-bar-container">
            <div className="health-bar">
              <div id="healthBarFill" style={{ width: `${(character.currentHealth / character.calculateMaxHealth()) * 100}%` }}></div>
              <div className="health-text">
                {translations[language].health}: {character.currentHealth} / {character.calculateMaxHealth()}
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
          <h3>{translations[language].ownedBuildings}:</h3>
          {Object.entries(getBuildingCounts(character.buildings)).map(([name, count], index) => (
            <p key={index}>{name} x{count}</p>
          ))}
        </section>
      )}
      {/* Display ongoing research under buildings */}
      {character && character.ongoingResearch && (
        <div className="research-progress">
          <p>{translations[language].ongoingResearch}: {character.ongoingResearch.name}</p>
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
          <button className="explore-btn" onClick={() => game.startExploring()}>
            {translations[language].descend}
          </button>
          <button
            className={`explore-btn ${!character.isExploring ? 'disabled' : ''}`}
            onClick={() => {
              if (character.isExploring) {
                game.ascend();
                setCharacter(character);
              }
            }}
            disabled={!character.isExploring}
          >
            {translations[language].ascend}
          </button>
          <button
            onClick={handleClimbUp}
            disabled={!character.inventory.some(item => (item.name === 'Rope' || item.name === 'Rep') && item.quantity > 0) || character.depth === 0 || character.depth === 1}
          >
            ⬆️
          </button>

          <button className={`character-stats-button ${character.isLevelingUp ? 'glow' : ''}`} onClick={() => setCharacterOverlayVisible(true)}>
            {translations[language].character}
          </button>
          <button onClick={() => setShopOverlayVisible(!shopOverlayVisible)}>Shop</button>

          {character.libraryBuilt && (
            <button onClick={() => setResearchOverlayVisible(true)}>Research</button>
          )}

          {researchOverlayVisible && (
            <ResearchOverlay
              character={character}
              setCharacter={setCharacter}
              setResearchOverlayVisible={setResearchOverlayVisible}
              researchTimers={researchTimers}
              language={language}
            />
          )}

          {/* Give Up Button */}
          <button onClick={resetGame}>{translations[language].giveUp}</button>
          {/* Debug button */}
          {debug && (<button className="debug-btn" onClick={() => {
            character.addDebugResources();
            setCharacter(character);
          }}>
            Debug: Add Resources
          </button>)}
          {debug && (
            <button onClick={increaseCharacterLevel}>
              Increase Level (Debug)
            </button>
          )}
          {debug && (<button onClick={generateRandomItem}>Generate Item (Debug)</button>)}
        </section>
      )}

    {game && game.hazardActive && (
      <div className="hazard-progress-container">
        <p>A village hazard is ongoing!</p>
        <div className="hazard-progress">
          <div
            className="hazard-progress-bar"
            style={{
              width: `${((game.hazardEndTime - Date.now()) / (game.hazardEndTime - (game.hazardEndTime - 60000))) * 100}%`
            }}
          ></div>
        </div>
      </div>
    )}

      {character && character.depth > 0 && character.currentMonsters.length > 0 && (
        <div>
          <h3>Active Monsters:</h3>
          <ul>
            {character.currentMonsters.map((monster, index) => (
              <li key={index}>
                {monster.name} - {monster.health} HP
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Log Section */}
      <section className="log-section" ref={logRef}>
        {log.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </section>

      {characterOverlayVisible && (
        <CharacterOverlay
          character={character}
          setCharacter={setCharacter}
          setCharacterOverlayVisible={setCharacterOverlayVisible}
          language={language}
        />
      )}

      {shopOverlayVisible && (
        <ShopOverlay
          character={character}
          setCharacter={setCharacter}
          setShopOverlayVisible={setShopOverlayVisible}
          language={language}
          shopItems={shopItems}
          setShopItems={setShopItems}
        />
      )}

      {generalMessage && (
        <MessageOverlay
          title={generalMessage.title}
          message={generalMessage.message}
          onClose={() => setGeneralMessage(null)}
          language={language}
        />
      )}
      {firstTimeOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>{translations[language].welcomeTitle}</h2>
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
        <label htmlFor="language">{translations[language].language}: </label>
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
        {highScores.slice(0, 10).map((score, index) => (
          <p key={`score-${index}`}>{index + 1}. {score.characterName}: {score.score}</p>
        ))}
      </div>

    </div>
  );
};

export default App;

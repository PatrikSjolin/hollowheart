import React, { useState, useEffect } from 'react';

const ResearchOverlay = ({ character, setCharacter, setResearchOverlayVisible }) => {
  // Time tracking state for each research
  const [researchTimers, setResearchTimers] = useState({
    lifeRegen: 0,
    expBoost: 0,
  });

  // Research options
  const researches = [
    {
      name: 'Increased Life Regen',
      description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 10 seconds.',
      timeRequired: 30 * 60 * 1000, // 30 minutes in milliseconds
      unlockCondition: character.intelligence >= 5, // Example condition based on intelligence
      effect: () => {
        character.lifeRegenRate = 10; // Apply effect to character
      },
    },
    {
      name: 'Increased Experience Boost',
      description: 'Increase experience gained by 15%.',
      timeRequired: 60 * 60 * 1000, // 1 hour in milliseconds
      unlockCondition: character.buildings.includes('Library'), // Example condition based on owning buildings
      effect: () => {
        character.expBoost = 1.15; // Apply 15% boost to experience gained
      },
    },
  ];

  // Function to handle starting research
  const startResearch = (research) => {
    setResearchTimers((prevState) => ({
      ...prevState,
      [research.name]: research.timeRequired,
    }));
    setCharacter({ ...character });
  };

  // Handle countdown for research timers
  useEffect(() => {
    const timer = setInterval(() => {
      setResearchTimers((prevState) => {
        const newTimers = { ...prevState };
        Object.keys(newTimers).forEach((research) => {
          if (newTimers[research] > 0) {
            newTimers[research] -= 1000;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle applying the research effects when the timer reaches 0
  useEffect(() => {
    Object.keys(researchTimers).forEach((researchName) => {
      const research = researches.find((r) => r.name === researchName);
      if (researchTimers[researchName] === 0 && research) {
        research.effect();
        setCharacter({ ...character });
      }
    });
  }, [researchTimers, character, researches, setCharacter]);

  return (
    <div className="overlay">
      <div className="overlay-content">
        <span className="close-btn" onClick={() => setResearchOverlayVisible(false)}>&times;</span>
        <h2>Research</h2>
        <p>Choose a research to enhance your character's abilities.</p>

        {/* List available researches */}
        {researches.map((research, index) => (
          <div key={index} className="research-item">
            <p><strong>{research.name}</strong></p>
            <p>{research.description}</p>
            <p>Time required: {research.timeRequired / 60000} minutes</p>
            <button
              onClick={() => startResearch(research)}
              disabled={researchTimers[research.name] > 0 || !research.unlockCondition}
            >
              {researchTimers[research.name] > 0
                ? `Research in progress (${Math.floor(researchTimers[research.name] / 60000)} min left)`
                : 'Start Research'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchOverlay;

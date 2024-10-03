import { debug } from './App';
import React, { useEffect } from 'react';
import translations from './translations'; // Import translations

const ResearchOverlay = ({ character, setCharacter, setResearchOverlayVisible, researchTimers, language }) => {

    // Research options
    const researches = [
        {
            name: 'Increased Life Regen',
            description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 10 seconds.',
            timeRequired: 30 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 30 minutes in milliseconds
            unlockCondition: character.intelligence >= 25, // Example condition based on intelligence
            effect: () => {
                character.lifeRegenRate = 10; // Apply effect to character
            },
        },
        {
            name: 'Improved library',
            description: 'Research 20% faster',
            timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
            unlockCondition: character.intelligence >= 100, // Example condition based on owning buildings
            effect: () => {
                character.researchBoost = 1.2; // Apply effect to character
            },
        },
        {
            name: 'Increased Experience Boost',
            description: 'Increase experience gained by 15%.',
            timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
            unlockCondition: character.intelligence >= 35, // Example condition based on owning buildings
            effect: () => {
                character.expBoost = 1.15; // Apply 15% boost to experience gained
            },
        },
        {
            name: 'Golden Life Regen',
            description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 5 seconds.',
            timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
            unlockCondition: character.intelligence >= 40 && character.isResearchCompleted('Increased Life Regen'), // Example condition based on owning buildings
            effect: () => {
                character.lifeRegenRate = 5; // Apply effect to character
            },
        },
        {
            name: 'Heavy Life Regen',
            description: 'Increase life regeneration rate from 1 hitpoints per tick to 3.',
            timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1) * character.researchBoost, // 1 hour in milliseconds
            unlockCondition: character.intelligence >= 40 && character.isResearchCompleted('Increased Life Regen'), // Example condition based on owning buildings
            effect: () => {
                character.lifeRegen = 3; // Apply effect to character
            },
        },
    ];
    const availableResearches = researches.filter(research =>
        !character.isResearchCompleted(research.name) // Filter out completed research
    );

    // Function to handle starting research
    const startResearch = (research) => {
        const duration = research.timeRequired;
        character.startResearch(research, duration);
        setCharacter(character);
    };

    // Close the overlay when clicking outside the overlay content
    const handleClickOutside = (e) => {
        if (e.target.classList.contains('overlay')) {
            setResearchOverlayVisible(false);
        }
    };

    // Close the overlay when pressing Escape
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            setResearchOverlayVisible(false);
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
                <span className="close-btn" onClick={() => setResearchOverlayVisible(false)}>&times;</span>
                <h2>{translations[language].research}</h2>
                <p>Choose a research to enhance your character's abilities. More research options will be available by progressing in various ways.</p>

                {/* List available researches */}
                {availableResearches.filter(research => research.unlockCondition).map((research, index) => (
                    <div key={index} className="research-item">
                        <p><strong>{research.name}</strong></p>
                        <p>{research.description}</p>
                        <p>Time required: {research.timeRequired / 60000} minutes</p>
                        <button
                            onClick={() => startResearch(research)}
                            disabled={researchTimers || !research.unlockCondition}
                        >
                            {researchTimers ? `Research in progress (${Math.floor(researchTimers / 60000)} min left)` : 'Start Research'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResearchOverlay;

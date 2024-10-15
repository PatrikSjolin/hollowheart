import React, { useEffect } from 'react';
import translations from './translations'; // Import translations
import { Item } from './item'

const ResearchOverlay = ({ character, setCharacter, setResearchOverlayVisible, researchTimers, language, shopItems, setShopItems }) => {

    // Research options
    const researches = Item.getResearches(character, shopItems, setShopItems);

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

    const hasEnoughResources = (cost) => {
        return Object.entries(cost).every(([resource, amount]) => {
          return character.resources[resource] >= amount;
        });
      };

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
                        <p>Cost: {Object.entries(research.cost).map(([resource, amount]) => `${amount} ${resource}`).join(', ')}</p>
                        <button
                            onClick={() => startResearch(research)}
                            disabled={researchTimers || !research.unlockCondition || !hasEnoughResources(research.cost)}
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

// import React, { useState, useEffect } from 'react';

const ResearchOverlay = ({ character, setCharacter, setResearchOverlayVisible, researchTimers }) => {

    // const [researchTimers, setResearchTimers] = useState(character.getResearchProgress());

    // Research options
    const researches = [
        {
            name: 'Increased Life Regen',
            description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 10 seconds.',
            timeRequired: 30 * 1000, // 30 minutes in milliseconds
            unlockCondition: character.intelligence >= 15, // Example condition based on intelligence
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
    const availableResearches = researches.filter(research =>
        !character.isResearchCompleted(research.name) // Filter out completed research
    );

    // Function to handle starting research
    const startResearch = (research) => {
        const duration = research.timeRequired;
        character.startResearch(research, duration);
        setCharacter(character);
    };

    // Handle countdown for research timers
    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         const timeRemaining = character.getResearchProgress();
    //         if (timeRemaining === 0) {
    //             character.completeResearch();
    //             setResearchTimers(null);
    //             setCharacter(character);
    //         }
    //         else {
    //             setResearchTimers(timeRemaining);
    //         }
    //     }, 1000);

    //     return () => clearInterval(timer);
    // }, [character, setCharacter]);

    return (
        <div className="overlay">
            <div className="overlay-content">
                <span className="close-btn" onClick={() => setResearchOverlayVisible(false)}>&times;</span>
                <h2>Research</h2>
                <p>Choose a research to enhance your character's abilities.</p>

                {/* List available researches */}
                {availableResearches.map((research, index) => (
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

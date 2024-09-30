import { debug } from './App';

const ResearchOverlay = ({ character, setCharacter, setResearchOverlayVisible, researchTimers }) => {

    // Research options
    const researches = [
        {
            name: 'Increased Life Regen',
            description: 'Increase life regeneration rate from 1 every 20 seconds to 1 every 10 seconds.',
            timeRequired: 30 * 60 * 1000 * (debug ? 1 / 60 : 1), // 30 minutes in milliseconds
            unlockCondition: character.intelligence >= 15, // Example condition based on intelligence
            effect: () => {
                character.lifeRegenRate = 10; // Apply effect to character
            },
        },
        {
            name: 'Increased Experience Boost',
            description: 'Increase experience gained by 15%.',
            timeRequired: 60 * 60 * 1000 * (debug ? 1 / 60 : 1), // 1 hour in milliseconds
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

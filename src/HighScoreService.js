export const HighscoreService = {
  
  sendHighscore: (characterName, score) => {
    const apiUrl = 'https://23ab-2001-9b1-4500-ef00-a4e3-da53-a84b-f3be.ngrok-free.app';
    return fetch(apiUrl + '/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ characterName, score }),
    })
    .then(response => response.json());
  },
  
  fetchHighscores: () => {
    const apiUrl = 'https://23ab-2001-9b1-4500-ef00-a4e3-da53-a84b-f3be.ngrok-free.app';
    return fetch(apiUrl + '/highscores', {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      }
    })
    .then(response => response.json());
  }
};

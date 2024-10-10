export const HighscoreService = {
  
  sendHighscore: (characterName, score) => {
    const apiUrl = 'https://eleven-pugs-pay.loca.lt';
    return fetch(apiUrl + '/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "bypass-tunnel-reminder": "69420",
      },
      body: JSON.stringify({ characterName, score }),
    })
    .then(response => response.json());
  },
  
  fetchHighscores: () => {
    const apiUrl = 'https://eleven-pugs-pay.loca.lt';
    return fetch(apiUrl + '/highscores', {
      headers: {
        "bypass-tunnel-reminder": "69420",
      },
      mode: 'cors',  // Ensure CORS mode is enabled
      method: 'GET',
    })
    .then(response => response.json());
  }
};

const url = 'https://ten-streets-add.loca.lt';

export const HighscoreService = {
    sendHighscore: (characterName, score) => {
    const apiUrl = url;
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
    const apiUrl = url;
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

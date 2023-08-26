// shared.js
// This file contains the logic for storing high scores.

function getHighScoreFromStorage() {
  return JSON.parse(localStorage.getItem("high_scores")) || {};
}

const SharedModule = {
  // Get the gameId from the URL
  getGameId: () => {
    const gameId = window.location.search.match(/id=(\w+)/)[1];
    return gameId;
  },

  // Get the high score for a given game or return 0
  getHighScore: (gameId) => {
    const existingHighScores = getHighScoreFromStorage();
    return existingHighScores[gameId] || 0;
  },

  // Set the high score for a given game
  setHighScore: (gameId, scoreValue) => {
    const existingHighScores = getHighScoreFromStorage();
    existingHighScores[gameId] = scoreValue;
    localStorage.setItem("high_scores", JSON.stringify(existingHighScores));
  }
};  

// Export the shared module object
window.SharedModule = SharedModule;

// Function to extract the score value from the specified table
function extractScoreValue() {
  const scoreTable = document.querySelector(".score-table tbody tr td:nth-child(2)");
  if (scoreTable) {
    const scoreText = scoreTable.textContent.trim();
    const scoreValue = parseFloat(scoreText.replaceAll(",", ""));
    return scoreValue;
  }
  return null;
}


// Function to save the high score in local storage if it's higher than the previous score
function saveHighScore(scoreValue, gameId) {
  const existingHighScores = window.SharedModule.getHighScore(gameId);;
  const previousHighScore = existingHighScores[gameId] || 0;
  
  if (scoreValue > previousHighScore) {
    window.SharedModule.setHighScore(gameId, scoreValue);
  }
}

// Main function to handle the complete page
function handleCompletePage() {
  const scoreValue = extractScoreValue();
  if (scoreValue !== null) {
    const gameId = window.SharedModule.getGameId();
    saveHighScore(scoreValue, gameId);
  }
}

// Call the main function to handle the complete page
handleCompletePage();
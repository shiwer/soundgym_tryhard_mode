// Function to extract the score value from the specified table
function extractScoreValue() {
  // Find the HTML element that has the high score value
  const scoreTable = document.querySelector(".score-table tbody tr td:nth-child(2)");
  // If a value has been found remove the ',' from the value to handle it like a normal number
  if (scoreTable) {
    const scoreText = scoreTable.textContent.trim();
    const scoreValue = parseFloat(scoreText.replaceAll(",", ""));
    return scoreValue;
  }
  return null;
}


// Function to save the high score in local storage if it's higher than the previous score
function saveHighScore(scoreValue, gameId) {
  // Get the existing high scores from local storage
  const existingHighScores = window.SharedModule.getHighScore(gameId);
    // Get the previous high score for the current game, defaulting to 0 if there's none
  const previousHighScore = existingHighScores[gameId] || 0;

   // Check if the current score is higher than the previous high score
  if (scoreValue > previousHighScore) {
     // Update the high score in local storage
    window.SharedModule.setHighScore(gameId, scoreValue);
  }
}

// Main function to handle the complete page
function handleCompletePage() {
  const scoreValue = extractScoreValue();
  // If we find a high score value save it to the local storage
  if (scoreValue !== null) {
    const gameId = window.SharedModule.getGameId();
    saveHighScore(scoreValue, gameId);
  }
}

// Call the main function to handle the complete page
handleCompletePage();
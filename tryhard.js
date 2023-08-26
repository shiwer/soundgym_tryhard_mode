// Get the gameId and high score for the current game
const gameId = window.SharedModule.getGameId();
const highScore = window.SharedModule.getHighScore(gameId);

let isExtensionActive = false;
let observerGameOver = null;
let currentValue = 0;
let highScoreDiv = null;

// Function to format a score value with commas for thousands
function formatScoreWithCommas(score) {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createHighScoreDiv() {
  // Create a styled div for displaying the current high score
  highScoreDiv = document.createElement('div');
  // Give it a id value
  highScoreDiv.id = 'high-score';
  // set the text of the div with the formatted value
  highScoreDiv.textContent = `Current High Score: ${formatScoreWithCommas(highScore)}`;

  // Find the game panel div and insert the high score div after it
  const gamePanelDiv = document.getElementById('game-panel');
  if (gamePanelDiv) {
    gamePanelDiv.insertAdjacentElement('afterend', highScoreDiv);
  }
}

function observeSpanPoints() {
  // The pointsSpan Element contains the current value of the user score.
  const pointsSpan = document.getElementById('points');
  if (pointsSpan) {
    // look for any mutation (evolution) of the score.
    const observerPoints = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
         // If the value changes, compare it to the high score
         const scoreText = pointsSpan.textContent.trim();
         currentValue = parseFloat(scoreText.replaceAll(",", ""));
         // If there is a new high score
         if(currentValue > highScore) {
          // Update the displayed high score
          highScoreDiv.textContent = `New High Score: ${formatScoreWithCommas(currentValue)}`;
          // Change the background color to green (with a smooth transition)
         highScoreDiv.classList.add('new'); // Add the 'new' class when a new high score is achieved
        }
      }
    }
  });

    // Start observing changes in the points span
    observerPoints.observe(pointsSpan, { childList: true });
  }
}


// Function to handle the extension state change
function handleExtensionStateChange(state) {
  isExtensionActive = state;
  if (isExtensionActive) {
    // Set up the observer when the extension is active
    createHighScoreDiv();
    startAudioPlayback();
    observeSpanPoints();
    handleGameOver();
  } else {
    // Disconnect the observer when the extension is inactive
    if (observerGameOver) {
      observerGameOver.disconnect();
      observerGameOver = null;
    }
  }
}

// Function to handle the button click and start the audio playback
function startAudioPlayback() {
  const gameReadyDiv = document.getElementById("game-ready");
  if (gameReadyDiv) {
    if (gameReadyDiv.classList.contains("active")) {
      // Start audio playback only if the button click is within a user gesture
      const buttonToClick = gameReadyDiv.querySelector("div.game-panel-cover-btn");
      buttonToClick.click();
    }
  }
}

// Function to handle the behavior on game over overlay
function handleGameOver() {
  const gameOverDiv = document.getElementById("game-over");
  if (gameOverDiv) {
    // we reload only if it's not a new high score.
    // we noticed the gameOverDiv has active class when the game ends.
    if (gameOverDiv.classList.contains("active") && !(currentValue > highScore)) {
      reloadAndPlayAgain();
    } 
    else {
      // Observe changes on the gameOverDiv to see when the active class is given
      observerGameOver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            // If the game ended and we have not beaten our high score refresh the page
            if (gameOverDiv.classList.contains("active") && !(currentValue > highScore)) {
              reloadAndPlayAgain();
            }
          }
        }
      });
      observerGameOver.observe(gameOverDiv, { attributes: true });
    }
  }
}

function reloadAndPlayAgain() {
  window.location.reload();
}

// Function to request the extension state from the background script using Promises
function getExtensionStateFromBackground() {
  // Await for an async response.
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getExtensionState" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("error : ", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.isExtensionActive);
      }
    });
  });
}

// Message listener to receive the extension state from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extensionStateChanged") {
    handleExtensionStateChange(message.isActive);
  }
});

// Request initial extension state from the background script using Promises
async function initializeExtensionState() {
  try {
    const state = await getExtensionStateFromBackground();
    handleExtensionStateChange(state);
  } catch (error) {
    console.error("Error getting extension state:", error);
  }
}

// Call the initializeExtensionState function to request the extension state from the background script
setTimeout(() => {
  initializeExtensionState();
}, 500);

// Add a click event listener to the document to start audio playback on user gesture
document.addEventListener("click", startAudioPlayback);
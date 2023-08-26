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
  highScoreDiv.id = 'high-score';
  highScoreDiv.textContent = `Current High Score: ${formatScoreWithCommas(highScore)}`;

  // Find the game panel div and insert the high score div after it
  const gamePanelDiv = document.getElementById('game-panel');
  if (gamePanelDiv) {
    gamePanelDiv.insertAdjacentElement('afterend', highScoreDiv);
  }
}

function observeSpanPoints() {
  const pointsSpan = document.getElementById('points');
  if (pointsSpan) {
    const observerPoints = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
         const scoreText = pointsSpan.textContent.trim();
         currentValue = parseFloat(scoreText.replaceAll(",", ""));
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
  console.log("Content Script: Extension state changed. Active:", isExtensionActive);
  if (isExtensionActive) {
    // Set up the observer when the extension is active
    console.log("Content Script: Observer set up.");

    createHighScoreDiv();
    startAudioPlayback();
    observeSpanPoints();
    handleGameOver();

  } else {
    // Disconnect the observer when the extension is inactive
    console.log("Content Script: Observer disconnected.", observerGameOver);
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
      console.log("Content Script: 'active' class added to 'game-ready' div. Starting audio playback...");
      const buttonToClick = gameReadyDiv.querySelector("div.game-panel-cover-btn");
      buttonToClick.click();
    }
  }
}

function handleGameOver() {
  const gameOverDiv = document.getElementById("game-over");
  if (gameOverDiv) {
    // we reload only if it's not a new high score.
    if (gameOverDiv.classList.contains("active") && !(currentValue > highScore)) {
      reloadAndPlayAgain();
    } 
    else {
      observerGameOver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            if (gameOverDiv.classList.contains("active") && !(currentValue > highScore)) {
                // Refresh the page when "active" class is added to "game-over" div
              console.log("Content Script: 'active' class added to 'game-over' div. Refreshing page...");
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
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getExtensionState" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("error : ", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log("resolving : ", response);
        resolve(response.isExtensionActive);
      }
    });
  });
}

// Message listener to receive the extension state from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extensionStateChanged") {
    console.log("value has changed. New extension value:", message.isActive);
    handleExtensionStateChange(message.isActive);
  }
});

// Request initial extension state from the background script using Promises
async function initializeExtensionState() {
  try {
    const state = await getExtensionStateFromBackground();
    console.log("Getting extension state: ", state);
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
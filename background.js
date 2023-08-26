let isExtensionActive;

function updateIcon() {
  // set the green icon when application is active otherwise set the black one
  const iconPath = isExtensionActive ? "icon-green" : "icon-black";
  chrome.action.setIcon({ path: { 16: iconPath + "-16.png", 48: iconPath + "-48.png"} });
}

// Function to update the extension state and save it to chrome.storage
function updateExtensionState(newState) {
  isExtensionActive = newState;
  chrome.storage.local.set({ isExtensionActive: isExtensionActive });
  updateIcon();
}

function toggleExtensionState() {
  updateExtensionState(!isExtensionActive);
  // Send message to the content script to inform about the extension state
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { action: "extensionStateChanged", isExtensionActive: isExtensionActive });
    }
  });
}

// Add a click event listener to the extension's icon
chrome.action.onClicked.addListener(toggleExtensionState);

// Listen to the onStartup event to set the initial icon state
chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.get(["isExtensionActive"]).then((data) => {
    isExtensionActive = data.isExtensionActive !== undefined ? data.isExtensionActive : false;
    updateIcon();
  });
});


// Message listener to handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getExtensionState") {
    (async () => {
      const data = await chrome.storage.local.get(["isExtensionActive"]);
      isExtensionActive = data.isExtensionActive !== undefined ? data.isExtensionActive : false;
      sendResponse({ isExtensionActive: isExtensionActive });
    })();
    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});

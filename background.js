// Initialize when extension starts or is installed
chrome.runtime.onStartup.addListener(() => {
  formatAllBookmarksForAITight();
});

chrome.runtime.onInstalled.addListener(() => {
  formatAllBookmarksForAITight();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectPrompt') {
    handlePromptInjection(message.tabId, message.service, message.prompt);
    return true; // Indicates async response
  }

  if (message.action === 'registerShortcut') {
    registerKeyboardShortcut(message.enabled);
    return true;
  }
});

// Global shortcut enabled flag
let shortcutEnabled = true;

// Register keyboard shortcut enabled/disabled state
function registerKeyboardShortcut(enabled) {
  shortcutEnabled = enabled;
  console.log(`Keyboard shortcut ${enabled ? 'enabled' : 'disabled'}: Ctrl+Q`);

  // Store the shortcut settings in storage
  chrome.storage.sync.set({
    'shortcutEnabled': enabled
  });
}

// Initialize shortcut settings
chrome.storage.sync.get({
  shortcutEnabled: true
}, function(items) {
  shortcutEnabled = items.shortcutEnabled;

  if (items.shortcutEnabled) {
    console.log('Initializing keyboard shortcut: Ctrl+Q');
  } else {
    console.log('Keyboard shortcut is disabled');
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_popup') {
    // Only open the popup if shortcuts are enabled
    chrome.storage.sync.get({
      shortcutEnabled: true
    }, function(items) {
      if (items.shortcutEnabled) {
        // Open the popup
        chrome.action.openPopup();
      } else {
        console.log('Keyboard shortcut is disabled in settings');
      }
    });
  }
});

// Format all bookmarks in Markdown format
function formatAllBookmarksForAITight() {
  chrome.bookmarks.getTree(function(results) {
    let formattedBookmarks = "";

    function traverseBookmarks(nodes) {
      for (const node of nodes) {
        if (node.url) {
          formattedBookmarks += `- [${node.title}](${node.url})\n`;
        }
        if (node.children) {
          traverseBookmarks(node.children);
        }
      }
    }

    for (const rootNode of results) {
      if (rootNode.children) {
        traverseBookmarks(rootNode.children);
      }
    }

    console.log("Bookmarks formatted in Markdown:");
    console.log(formattedBookmarks.substring(0, 200) + "...");
  });
}

// Handle prompt injection by communicating with the content script
function handlePromptInjection(tabId, service, prompt) {
  console.log(`Handling prompt injection for ${service} in tab ${tabId}`);

  // Set up a listener for tab updates
  chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo, tab) {
    // Check if this is the tab we're waiting for and if it's done loading
    if (updatedTabId === tabId && changeInfo.status === 'complete') {
      // Remove the listener to avoid multiple injections
      chrome.tabs.onUpdated.removeListener(listener);

      console.log(`Tab ${tabId} is loaded, waiting before sending message...`);

      // Wait longer to ensure page and content script are fully loaded
      setTimeout(() => {
        console.log(`Sending fillPrompt message to tab ${tabId}`);
        chrome.tabs.sendMessage(tabId, {
          action: 'fillPrompt',
          service: service,
          prompt: prompt
        }, response => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);

            // Try again after a longer delay if the first attempt failed
            console.log("Retrying after a longer delay...");
            setTimeout(() => {
              console.log(`Retrying fillPrompt message to tab ${tabId}`);
              chrome.tabs.sendMessage(tabId, {
                action: 'fillPrompt',
                service: service,
                prompt: prompt
              }, retryResponse => {
                if (chrome.runtime.lastError) {
                  console.error("Retry also failed:", chrome.runtime.lastError);
                } else if (retryResponse && retryResponse.success) {
                  console.log("Content script successfully received the message on retry");
                }
              });
            }, 5000);
          } else if (response && response.success) {
            console.log("Content script successfully received the message");
          }
        });
      }, 3000);
    }
  });
}
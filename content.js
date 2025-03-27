// Content script for Bookmark AI Search extension

console.log("Bookmark AI Search content script loaded");

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillPrompt') {
    console.log("Received fillPrompt message with service:", message.service);
    fillPromptIntoAIService(message.service, message.prompt);
    sendResponse({success: true});
    return true;
  }
});

// Function to fill prompt into AI service
function fillPromptIntoAIService(service, prompt) {
  console.log("Filling prompt for service:", service);

  // Helper function to wait for an element to appear in the DOM
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not found: ${selector}`));
          return;
        }

        setTimeout(checkElement, 300);
      };

      checkElement();
    });
  }

  // Helper function to fill text into an input element
  function fillText(element, text) {
    if (element.tagName.toLowerCase() === 'textarea') {
      element.value = text;
    } else {
      element.textContent = text;
    }

    // Trigger input event to notify the application of the change
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Service-specific selectors
  const selectors = {
    gemini: {
      input: 'textarea, div[contenteditable="true"], [role="textbox"]',
      button: 'button[aria-label="Send message"], button[aria-label="發送訊息"], button[type="submit"]'
    },
    openai: {
      input: 'textarea[data-id="root"], textarea.text-input, [role="textbox"]',
      button: 'button[data-testid="send-button"], button[type="submit"]'
    },
    grok: {
      input: 'textarea, [role="textbox"]',
      button: 'button[type="submit"]'
    }
  };

  // Get selectors for the requested service
  const serviceSelectors = selectors[service];
  if (!serviceSelectors) {
    console.error("Unknown AI service:", service);
    return;
  }

  // Find input element, fill prompt, and click send button
  waitForElement(serviceSelectors.input)
    .then(inputElement => {
      console.log(`Found ${service} input element:`, inputElement);
      fillText(inputElement, prompt);
      return waitForElement(serviceSelectors.button);
    })
    .then(sendButton => {
      console.log(`Found ${service} send button:`, sendButton);
      sendButton.click();
      console.log(`Clicked ${service} send button`);
    })
    .catch(error => {
      console.error(`Error in ${service} injection:`, error);
    });
}
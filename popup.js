document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const searchInput = document.getElementById('searchInput');
  const aiSelect = document.getElementById('aiSelect');
  const aiSelectLabel = document.getElementById('aiSelectLabel');
  const languageSelect = document.getElementById('languageSelect');
  const languageSelectLabel = document.getElementById('languageSelectLabel');
  const searchButton = document.getElementById('searchButton');
  const organizeButton = document.getElementById('organizeButton');
  const copyPromptButton = document.getElementById('copyPromptButton');
  const statusMessage = document.getElementById('statusMessage');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const loadingText = loadingIndicator.querySelector('span');
  const appTitle = document.querySelector('h1');
  const searchInputLabel = document.querySelector('label[for="searchInput"]');

  // Store formatted bookmarks
  let formattedBookmarks = "";

  // Current language (default: Chinese)
  let currentLanguage = 'zh';

  // Translations
  const translations = {
    zh: {
      appTitle: 'Bookmark AI Search',
      searchInputLabel: '搜尋關鍵字:',
      searchInputPlaceholder: '輸入搜尋關鍵字查找關聯書籤 ',
      aiSelectLabel: '選擇 AI 服務:',
      languageSelectLabel: '語言 / Language:',
      searchButton: '精確搜尋',
      organizeButton: '關聯查找',
      copyPromptButton: '複製 Prompt',
      copySuccess: 'Prompt 已複製到剪貼簿！',
      copyFailed: '複製失敗，請重試',
      statusReady: '準備就緒，請輸入搜尋關鍵字。',
      statusFetchingBookmarks: '正在獲取書籤...',
      statusBookmarksReady: '書籤已準備就緒，請輸入搜尋關鍵字。',
      statusEmptySearch: '請輸入搜尋關鍵字！',
      statusBookmarksNotReady: '書籤尚未準備好，請稍候...',
      statusProcessingRequest: '正在處理您的{action}請求...',
      statusOpenedAI: '已在新分頁中開啟 {service}，並準備填入提示。',
      loadingText: '正在處理書籤並連接 AI...',
      searchAction: '搜尋',
      organizeAction: '整理',
      promptSearch: '精準查找 必須是完全符合主題的書籤\n分類相關的書籤,整理成表格形式。用table 整理先歸類 然後欄位是 \ntitle , explain,url .url 要是超連結可以直接點選\n用表情符號來區隔不同的分類，讓表格更具視覺區分效果並保持清晰。\n',
      promptOrganize: '整理分類相關的書籤,整理成表格形式。用table 整理先歸類 然後欄位是 \ntitle , explain,url .url 要是超連結可以直接點選\n用表情符號來區隔不同的分類，讓表格更具視覺區分效果並保持清晰。\n',
      promptIntro: '你幫我找到關於內容是[{searchTerm}] \n\n',
      promptBookmarkIntro: '以下是書籤\n[bookmark]\n',
      promptBookmarkOutro: '[/bookmark]',
      // Help modal translations
      helpModalTitle: '使用說明',
      helpSearchTitle: '精確搜尋',
      helpSearchText: '輸入關鍵字後點擊「精確搜尋」，ai會找和搜尋關鍵字最相關聯的書籤',
      helpOrganizeTitle: '關聯查找',
      helpOrganizeText: '點擊此按鈕，AI會找出相關書籤並整理成表格。',
      helpCopyTitle: '複製 Prompt',
      helpCopyText: '點擊此按鈕複製提示到剪貼簿，可貼上到任何AI服務。',
      helpAITitle: 'AI 服務',
      helpAIText: '選擇AI服務（推薦使用Grok）。',
      helpAuthorText: '作者: bahfahh',
      // Settings modal translations
      settingsTitle: '設定',
      shortcutSettingsTitle: '快捷鍵設定',
      enableShortcutLabel: '啟用快捷鍵 (Ctrl+Q)',
      shortcutNote: '注意：要更改快捷鍵，請前往 Chrome 選單 > 擴充功能 > 鍵盤快捷鍵',
      promptSettingsTitle: '提示詞設定',
      promptSearchLabel: '精確搜尋提示詞:',
      promptOrganizeLabel: '關聯查找提示詞:',
      resetPromptsButton: '重置為預設值',
      saveSettingsButton: '儲存',
      settingsSaved: '設定已儲存',
      settingsError: '儲存設定時發生錯誤'
    },
    en: {
      appTitle: 'Bookmark AI Search',
      searchInputLabel: 'Search Keywords:',
      searchInputPlaceholder: 'Enter search keywords (e.g.: python, machine learning)',
      aiSelectLabel: 'Select AI Service:',
      languageSelectLabel: 'Language / 語言:',
      searchButton: 'Precise Search',
      organizeButton: 'Related Search',
      copyPromptButton: 'Copy Prompt',
      copySuccess: 'Prompt copied to clipboard!',
      copyFailed: 'Copy failed, please try again',
      statusReady: 'Ready, please enter search keywords.',
      statusFetchingBookmarks: 'Fetching bookmarks...',
      statusBookmarksReady: 'Bookmarks ready, please enter search keywords.',
      statusEmptySearch: 'Please enter search keywords!',
      statusBookmarksNotReady: 'Bookmarks not ready yet, please wait...',
      statusProcessingRequest: 'Processing your {action} request...',
      statusOpenedAI: 'Opened {service} in a new tab and preparing to input the prompt.',
      loadingText: 'Processing bookmarks and connecting to AI...',
      searchAction: 'search',
      organizeAction: 'organize',
      promptSearch: 'Precise search for bookmarks that exactly match the topic.\nCategorize related bookmarks in a table format. Use tables to organize with columns for \ntitle, explain, and url. URLs should be clickable hyperlinks.\nUse emojis to separate different categories for better visual distinction while maintaining clarity.\n',
      promptOrganize: 'Organize and categorize related bookmarks in a table format. Use tables to categorize with columns for \ntitle, explain, and url. URLs should be clickable hyperlinks.\nUse emojis to separate different categories for better visual distinction while maintaining clarity.\n',
      promptIntro: 'Please help me find content related to [{searchTerm}] \n\n',
      promptBookmarkIntro: 'Here are my bookmarks:\n[bookmark]\n',
      promptBookmarkOutro: '[/bookmark]',
      // Help modal translations
      helpModalTitle: 'User Guide',
      helpSearchTitle: 'Precise Search',
      helpSearchText: 'After entering keywords and clicking "Precise Search", AI will find bookmarks most relevant to your search keywords.',
      helpOrganizeTitle: 'Related Search',
      helpOrganizeText: 'Click this button to find related bookmarks and organize them in a table format.',
      helpCopyTitle: 'Copy Prompt',
      helpCopyText: 'Click to copy the prompt to clipboard for pasting into any AI service.',
      helpAITitle: 'AI Service',
      helpAIText: 'Select an AI service (Grok recommended).',
      helpAuthorText: 'Author: bahfahh',
      // Settings modal translations
      settingsTitle: 'Settings',
      shortcutSettingsTitle: 'Keyboard Shortcut Settings',
      enableShortcutLabel: 'Enable Keyboard Shortcut (Ctrl+Q)',
      shortcutNote: 'Note: To change the shortcut, go to Chrome menu > Extensions > Keyboard shortcuts',
      promptSettingsTitle: 'Prompt Settings',
      promptSearchLabel: 'Precise Search Prompt:',
      promptOrganizeLabel: 'Related Search Prompt:',
      resetPromptsButton: 'Reset to Default',
      saveSettingsButton: 'Save',
      settingsSaved: 'Settings saved',
      settingsError: 'Error saving settings'
    }
  };

  // Initialize
  // Set default AI to Grok
  aiSelect.value = 'grok';
  loadLanguagePreference();
  fetchAllBookmarks();

  // Get modal elements
  const helpButton = document.getElementById('helpButton');
  const helpModal = document.getElementById('helpModal');
  const closeHelpButton = document.getElementById('closeHelpButton');
  const settingsButton = document.getElementById('settingsButton');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsButton = document.getElementById('closeSettingsButton');
  const saveSettingsButton = document.getElementById('saveSettingsButton');

  // Help modal elements
  const helpModalTitle = document.getElementById('helpModalTitle');
  const helpSearchTitle = document.getElementById('helpSearchTitle');
  const helpSearchText = document.getElementById('helpSearchText');
  const helpOrganizeTitle = document.getElementById('helpOrganizeTitle');
  const helpOrganizeText = document.getElementById('helpOrganizeText');
  const helpCopyTitle = document.getElementById('helpCopyTitle');
  const helpCopyText = document.getElementById('helpCopyText');
  const helpAITitle = document.getElementById('helpAITitle');
  const helpAIText = document.getElementById('helpAIText');
  const helpLanguageTitle = document.getElementById('helpLanguageTitle');
  const helpLanguageText = document.getElementById('helpLanguageText');
  const helpAuthorText = document.getElementById('helpAuthorText');
// Settings modal elements
const settingsTitle = document.querySelector('.modal-title');
const shortcutSettingsTitle = document.getElementById('shortcutSettingsTitle');
const enableShortcutLabel = document.getElementById('enableShortcutLabel');
const shortcutEnabledCheckbox = document.getElementById('shortcutEnabledCheckbox');
const promptSettingsTitle = document.getElementById('promptSettingsTitle');
const promptSearchLabel = document.getElementById('promptSearchLabel');
const promptSearchTextarea = document.getElementById('promptSearchTextarea');
const promptOrganizeLabel = document.getElementById('promptOrganizeLabel');
const promptOrganizeTextarea = document.getElementById('promptOrganizeTextarea');
const resetPromptsButton = document.getElementById('resetPromptsButton');

// Custom prompts storage
let customPromptSearch = '';
let customPromptOrganize = '';
let shortcutEnabled = true;

// Add event listeners to buttons
searchButton.addEventListener('click', function() {
  processUserRequest('search');
});

organizeButton.addEventListener('click', function() {
  processUserRequest('organize');
});

copyPromptButton.addEventListener('click', function() {
  copyPromptToClipboard();
});

// Help button event listener
helpButton.addEventListener('click', function() {
  helpModal.style.display = 'block';
  updateHelpLanguage();
});

// Close help modal when clicking the close button
closeHelpButton.addEventListener('click', function() {
  helpModal.style.display = 'none';
});

// Settings button event listener
settingsButton.addEventListener('click', function() {
  settingsModal.style.display = 'block';
  loadSettings();
  updateSettingsLanguage();
});

// Close settings modal when clicking the close button
closeSettingsButton.addEventListener('click', function() {
  settingsModal.style.display = 'none';
});

// Close modals when clicking outside of them
window.addEventListener('click', function(event) {
  if (event.target === helpModal) {
    helpModal.style.display = 'none';
  }
  if (event.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

// Add event listener for language change
languageSelect.addEventListener('change', function() {
  currentLanguage = languageSelect.value;
  saveLanguagePreference();
  updateUILanguage();
  updateHelpLanguage();
  updateSettingsLanguage();
});

// Save settings button event listener
saveSettingsButton.addEventListener('click', function() {
  saveSettings();
  settingsModal.style.display = 'none';
  statusMessage.textContent = getText('settingsSaved');
  statusMessage.classList.remove('status-error');
});

// Reset prompts button event listener
resetPromptsButton.addEventListener('click', function() {
  resetPromptsToDefault();
});

// Shortcut enabled checkbox event listener
shortcutEnabledCheckbox.addEventListener('change', function() {
  // Just update the enabled state
});

  // Function to copy prompt to clipboard
  function copyPromptToClipboard() {
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
      statusMessage.textContent = getText('statusEmptySearch');
      statusMessage.classList.add('status-error');
      return;
    }

    // Create the prompt
    const prompt = createPrompt(searchTerm, 'organize');

    // Copy to clipboard
    navigator.clipboard.writeText(prompt)
      .then(() => {
        statusMessage.textContent = getText('copySuccess');
        statusMessage.classList.remove('status-error');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        statusMessage.textContent = getText('copyFailed');
        statusMessage.classList.remove('status-error');
      });
  }

  // Function to load language preference
  function loadLanguagePreference() {
    chrome.storage.sync.get('language', function(data) {
      if (data.language) {
        currentLanguage = data.language;
        languageSelect.value = currentLanguage;
      }
      updateUILanguage();
    });
  }

  // Function to save language preference
  function saveLanguagePreference() {
    chrome.storage.sync.set({ 'language': currentLanguage });
  }

  // Function to update UI language
  function updateUILanguage() {
    const lang = translations[currentLanguage];

    // Update static UI elements
    appTitle.textContent = lang.appTitle;
    searchInputLabel.textContent = lang.searchInputLabel;
    searchInput.placeholder = lang.searchInputPlaceholder;
    aiSelectLabel.textContent = lang.aiSelectLabel;
    languageSelectLabel.textContent = lang.languageSelectLabel;
    searchButton.textContent = lang.searchButton;
    organizeButton.textContent = lang.organizeButton;
    copyPromptButton.textContent = lang.copyPromptButton;
    loadingText.textContent = lang.loadingText;

    // Update dynamic status message based on current state
    if (statusMessage.textContent.includes('準備就緒') || statusMessage.textContent.includes('Ready')) {
      statusMessage.textContent = lang.statusReady;
      statusMessage.classList.remove('status-error');
    } else if (statusMessage.textContent.includes('正在獲取') || statusMessage.textContent.includes('Fetching')) {
      statusMessage.textContent = lang.statusFetchingBookmarks;
      statusMessage.classList.remove('status-error');
    } else if (statusMessage.textContent.includes('書籤已準備') || statusMessage.textContent.includes('Bookmarks ready')) {
      statusMessage.textContent = lang.statusBookmarksReady;
      statusMessage.classList.remove('status-error');
    }
  }

  // Function to update help modal language
  function updateHelpLanguage() {
    const lang = translations[currentLanguage];

    // Update help modal content
    helpModalTitle.textContent = lang.helpModalTitle;
    helpSearchTitle.textContent = lang.helpSearchTitle;
    helpSearchText.textContent = lang.helpSearchText;
    helpOrganizeTitle.textContent = lang.helpOrganizeTitle;
    helpOrganizeText.textContent = lang.helpOrganizeText;
    helpCopyTitle.textContent = lang.helpCopyTitle;
    helpCopyText.textContent = lang.helpCopyText;
    helpAITitle.textContent = lang.helpAITitle;
    helpAIText.textContent = lang.helpAIText;
    helpLanguageTitle.textContent = lang.helpLanguageTitle;
    helpLanguageText.textContent = lang.helpLanguageText;
    helpAuthorText.textContent = lang.helpAuthorText;
  }

  // Function to update settings modal language
  function updateSettingsLanguage() {
    const lang = translations[currentLanguage];

    // Update settings modal content
    settingsTitle.textContent = lang.settingsTitle;
    shortcutSettingsTitle.textContent = lang.shortcutSettingsTitle;
    enableShortcutLabel.textContent = lang.enableShortcutLabel;
    document.getElementById('shortcutNote').textContent = lang.shortcutNote;
    promptSettingsTitle.textContent = lang.promptSettingsTitle;
    promptSearchLabel.textContent = lang.promptSearchLabel;
    promptOrganizeLabel.textContent = lang.promptOrganizeLabel;
    resetPromptsButton.textContent = lang.resetPromptsButton;
    saveSettingsButton.textContent = lang.saveSettingsButton;
  }

  // Function to load settings
  function loadSettings() {
    chrome.storage.sync.get({
      shortcutEnabled: true,
      customPromptSearch: translations[currentLanguage].promptSearch,
      customPromptOrganize: translations[currentLanguage].promptOrganize
    }, function(items) {
      shortcutEnabled = items.shortcutEnabled;
      customPromptSearch = items.customPromptSearch;
      customPromptOrganize = items.customPromptOrganize;

      // Update UI
      shortcutEnabledCheckbox.checked = shortcutEnabled;
      promptSearchTextarea.value = customPromptSearch;
      promptOrganizeTextarea.value = customPromptOrganize;
    });
  }

  // Function to save settings
  function saveSettings() {
    shortcutEnabled = shortcutEnabledCheckbox.checked;
    customPromptSearch = promptSearchTextarea.value;
    customPromptOrganize = promptOrganizeTextarea.value;

    chrome.storage.sync.set({
      shortcutEnabled: shortcutEnabled,
      customPromptSearch: customPromptSearch,
      customPromptOrganize: customPromptOrganize
    }, function() {
      // Update keyboard shortcut settings
      chrome.runtime.sendMessage({
        action: 'registerShortcut',
        enabled: shortcutEnabled
      });

      statusMessage.textContent = getText('settingsSaved');
      statusMessage.classList.remove('status-error');
    });
  }

  // Function to reset prompts to default
  function resetPromptsToDefault() {
    promptSearchTextarea.value = translations[currentLanguage].promptSearch;
    promptOrganizeTextarea.value = translations[currentLanguage].promptOrganize;
  }

  // Function to get translated text
  function getText(key, replacements = {}) {
    let text = translations[currentLanguage][key] || key;

    // Replace placeholders with actual values
    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replace(`{${placeholder}}`, value);
    }

    return text;
  }

  // Function to fetch all bookmarks
  function fetchAllBookmarks() {
    statusMessage.textContent = getText('statusFetchingBookmarks');
    statusMessage.classList.remove('status-error');

    chrome.bookmarks.getTree(function(results) {
      formattedBookmarks = "";

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

      statusMessage.textContent = getText('statusBookmarksReady');
      statusMessage.classList.remove('status-error');
      console.log("Bookmarks formatted:", formattedBookmarks.substring(0, 100) + "...");
    });
  }

  // Function to process user request (search or organize)
  function processUserRequest(action) {
    const searchTerm = searchInput.value.trim();
    const selectedAI = aiSelect.value;

    if (!searchTerm) {
      statusMessage.textContent = getText('statusEmptySearch');
      statusMessage.classList.add('status-error');
      return;
    }

    if (!formattedBookmarks) {
      statusMessage.textContent = getText('statusBookmarksNotReady');
      statusMessage.classList.remove('status-error');
      return;
    }

    // Show loading indicator
    loadingIndicator.style.display = "block";
    const actionText = action === 'search' ? getText('searchAction') : getText('organizeAction');
    statusMessage.textContent = getText('statusProcessingRequest', { action: actionText });
    statusMessage.classList.remove('status-error');

    // Create the prompt based on user input
    const prompt = createPrompt(searchTerm, action);

    // Open the selected AI service in a new tab
    openAIServiceWithPrompt(selectedAI, prompt);
  }

  // Function to create the prompt
  function createPrompt(searchTerm, action) {
    // For organize action, always use the organize prompt format
    if (action === 'organize') {
      let promptText = getText('promptIntro', { searchTerm });
      // Use custom prompt if available, otherwise use default
      let promptOrganize = customPromptOrganize || getText('promptOrganize');
      promptText += promptOrganize;
      promptText += getText('promptBookmarkIntro');
      promptText += formattedBookmarks;
      promptText += getText('promptBookmarkOutro');
      return promptText;
    }
    // For search action, use the search prompt format
    else {
      let promptText = getText('promptIntro', { searchTerm });
      // Use custom prompt if available, otherwise use default
      let promptSearch = customPromptSearch || getText('promptSearch');
      promptText += promptSearch;
      promptText += getText('promptBookmarkIntro');
      promptText += formattedBookmarks;
      promptText += getText('promptBookmarkOutro');
      return promptText;
    }
  }

  // Function to open AI service with the prompt
  function openAIServiceWithPrompt(service, prompt) {
    let url;

    switch (service) {
      case 'gemini':
        url = 'https://gemini.google.com/app';
        break;
      case 'openai':
        url = 'https://chat.openai.com/';
        break;
      case 'grok':
        url = 'https://grok.com/';
        break;
      default:
        url = 'https://gemini.google.com/app';
    }

    // Open a new tab with the selected AI service
    chrome.tabs.create({ url: url }, function(tab) {
      // We need to wait for the page to load before injecting the script
      // Send message to the background script to handle the prompt injection
      chrome.runtime.sendMessage({
        action: 'injectPrompt',
        tabId: tab.id,
        service: service,
        prompt: prompt
      }, response => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to background script:", chrome.runtime.lastError);
        }
      });

      // Update status and hide loading indicator
      statusMessage.textContent = getText('statusOpenedAI', { service: getServiceName(service) });
      statusMessage.classList.remove('status-error');
      loadingIndicator.style.display = "none";
    });
  }

  // Helper function to get service name
  function getServiceName(service) {
    switch (service) {
      case 'gemini': return 'Gemini';
      case 'openai': return 'OpenAI';
      case 'grok': return 'Grok';
      default: return service;
    }
  }
});
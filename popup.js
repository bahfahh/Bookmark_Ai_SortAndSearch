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
      searchButton: '搜尋',
      organizeButton: '整理',
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
      promptSearch: '找出相關的書籤並列出，按相關性排序。\n請提供每個書籤的簡短說明和URL (保持為可點擊的連結)。\n',
      promptOrganize: '整理分類相關的書籤,整理成表格形式。用table 整理先歸類 然後欄位是 \ntitle , explain,url .url 要是超連結可以直接點選\n用表情符號來區隔不同的分類，讓表格更具視覺區分效果並保持清晰。\n',
      promptIntro: '你幫我找到關於內容是[{searchTerm}] \n\n',
      promptBookmarkIntro: '以下是書籤\n[bookmark]\n',
      promptBookmarkOutro: '[/bookmark]'
    },
    en: {
      appTitle: 'Bookmark AI Search',
      searchInputLabel: 'Search Keywords:',
      searchInputPlaceholder: 'Enter search keywords (e.g.: python, machine learning)',
      aiSelectLabel: 'Select AI Service:',
      languageSelectLabel: 'Language / 語言:',
      searchButton: 'Search',
      organizeButton: 'Organize',
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
      promptSearch: 'Find related bookmarks and list them, sorted by relevance.\nProvide a brief description and URL for each bookmark (keep URLs as clickable links).\n',
      promptOrganize: 'Organize and categorize related bookmarks in a table format. Use tables to categorize with columns for \ntitle, explain, and url. URLs should be clickable hyperlinks.\nUse emojis to separate different categories for better visual distinction while maintaining clarity.\n',
      promptIntro: 'Please help me find content related to [{searchTerm}] \n\n',
      promptBookmarkIntro: 'Here are my bookmarks:\n[bookmark]\n',
      promptBookmarkOutro: '[/bookmark]'
    }
  };

  // Initialize
  loadLanguagePreference();
  fetchAllBookmarks();

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

  // Add event listener for language change
  languageSelect.addEventListener('change', function() {
    currentLanguage = languageSelect.value;
    saveLanguagePreference();
    updateUILanguage();
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
      promptText += getText('promptOrganize');
      promptText += getText('promptBookmarkIntro');
      promptText += formattedBookmarks;
      promptText += getText('promptBookmarkOutro');
      return promptText;
    }
    // For search action, use the search prompt format
    else {
      let promptText = getText('promptIntro', { searchTerm });
      promptText += getText('promptSearch');
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
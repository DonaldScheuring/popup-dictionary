chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate',
    title: 'Translate Word',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate' && tab.id) {
    chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (data) => {
      let source = data.sourceLanguage || 'en';
      let target = data.targetLanguage || 'ru';
      let word = info.selectionText;

      if (!word) {
        console.error('No word selected');
        return;
      }

      let url = `https://translate.google.com/#view=home&op=translate&sl=${source}&tl=${target}&text=${encodeURIComponent(word)}`;

      chrome.tabs.create({ url: url, active: false }, (newTab) => {
        chrome.scripting.executeScript({
          target: { tabId: newTab.id },
          func: fetchTranslation,
          args: [url]
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Script execution failed:', chrome.runtime.lastError);
          }
        });
      });
    });
  }
});

function fetchTranslation(url) {
  setTimeout(() => {
    let resultBox = document.querySelector('.result-container');
    if (resultBox) {
      chrome.runtime.sendMessage({ translation: resultBox.innerText });
    } else {
      chrome.runtime.sendMessage({ error: 'Translation not found.' });
    }
  }, 5000); // Wait 5 seconds for the page to load and translation to appear
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.translation) {
    chrome.storage.local.set({ translation: message.translation }, () => {
      chrome.action.setPopup({ popup: 'popup.html' });
      chrome.action.openPopup();
    });
  } else if (message.error) {
    console.error(message.error);
  }
});

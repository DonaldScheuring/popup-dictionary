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

      let url = `https://translate.google.com/#view=home&op=translate&sl=${source}&tl=${target}&text=${word}`;


      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fetchTranslation,
        args: [url]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Script execution failed:', chrome.runtime.lastError);
        }
      });
    });
  }
});

function fetchTranslation(url) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let resultBox = doc.querySelector('.result-container');
      if (resultBox) {
        alert('Translation: ' + resultBox.innerText);
      } else {
        alert('Translation not found.');
      }
    })
    .catch(error => {
      console.error('Error fetching translation:', error);
      alert('Translation error');
    });
}

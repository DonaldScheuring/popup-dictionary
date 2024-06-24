chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate',
    title: 'Translate Word',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: translateSelection,
      args: [info.selectionText]
    });
  }
});

function translateSelection(text) {
  chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (data) => {
    let source = data.sourceLanguage || 'en';
    let target = data.targetLanguage || 'es';

    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`)
      .then(response => response.json())
      .then(data => {
        alert(`Translation: ${data[0][0][0]}`);
      });
  });
}

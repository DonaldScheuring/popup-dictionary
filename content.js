// Load the API key from the configuration file
let script = document.createElement('script');
script.src = chrome.runtime.getURL('config.js');
script.onload = function() {
  // Safe to use config.API_KEY after this point
  document.head.removeChild(script);
};
document.head.appendChild(script);

let tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

document.addEventListener('mouseover', (event) => {
  let word = getWordUnderCursor(event);
  if (word) {
    translateWord(word, (translation) => {
      tooltip.textContent = translation;
      tooltip.style.left = event.pageX + 'px';
      tooltip.style.top = event.pageY + 'px';
      tooltip.style.display = 'block';
    });
  } else {
    tooltip.style.display = 'none';
  }
});

document.addEventListener('mousemove', (event) => {
  if (tooltip.style.display === 'block') {
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';
  }
});

document.addEventListener('mouseout', () => {
  tooltip.style.display = 'none';
});

function getWordUnderCursor(event) {
  let range, textNode, offset;

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent) {
    range = document.createRange();
    range.setStart(event.rangeParent, event.rangeOffset);
  }

  if (range && range.startContainer) {
    try {
      range.expand('word');
      textNode = range.startContainer;
      offset = range.startOffset;
      return textNode.textContent.slice(offset, range.endOffset).trim();
    } catch (e) {
      console.error('Error expanding range:', e);
    }
  }

  return null;
}

function translateWord(word, callback) {
  chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (data) => {
    let source = data.sourceLanguage || 'en';
    let target = data.targetLanguage || 'es';
    let apiKey = config.API_KEY; // Ensure config.API_KEY is loaded correctly

    fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodeURIComponent(word)}&source=${source}&target=${target}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.data && data.data.translations && data.data.translations.length > 0) {
          callback(data.data.translations[0].translatedText);
        } else {
          callback('Translation not available');
        }
      })
      .catch(error => {
        console.error('Error fetching translation:', error);
        callback('Translation error');
      });
  });
}
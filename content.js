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

  if (range) {
    range.expand('word');
    textNode = range.startContainer;
    offset = range.startOffset;
    return textNode.textContent.slice(offset, range.endOffset).trim();
  }

  return null;
}

function translateWord(word, callback) {
  chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (data) => {
    let source = data.sourceLanguage || 'en';
    let target = data.targetLanguage || 'es';

    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(word)}`)
      .then(response => response.json())
      .then(data => {
        callback(data[0][0][0]);
      });
  });
}

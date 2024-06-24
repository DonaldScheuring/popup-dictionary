document.getElementById('save').addEventListener('click', () => {
  const sourceLanguage = document.getElementById('sourceLanguage').value;
  const targetLanguage = document.getElementById('targetLanguage').value;

  chrome.storage.sync.set({ sourceLanguage, targetLanguage }, () => {
    alert('Settings saved');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (data) => {
    if (data.sourceLanguage) {
      document.getElementById('sourceLanguage').value = data.sourceLanguage;
    }
    if (data.targetLanguage) {
      document.getElementById('targetLanguage').value = data.targetLanguage;
    }
  });
});

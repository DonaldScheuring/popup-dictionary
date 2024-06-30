document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('translation', (data) => {
    if (data.translation) {
      document.getElementById('translation').textContent = data.translation;
    } else {
      document.getElementById('translation').textContent = 'Translation not found.';
    }
  });
});

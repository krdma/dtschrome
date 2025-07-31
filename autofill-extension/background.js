chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetch' && request.url) {
    fetch(request.url)
      .then(async (res) => {
        let data = null;
        try {
          data = await res.json();
        } catch (e) {
          data = await res.text();
        }
        sendResponse({ ok: res.ok, status: res.status, data });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.toString() });
      });
    return true;
  }
});

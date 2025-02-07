let activeTabId = null;
let activeUrl = null;
let lastUpdateTime = Date.now();

// Called periodically to calculate time spent on the active site
function updateTime() {
  const now = Date.now();
  const timeSpent = Math.floor((now - lastUpdateTime) / 1000);
  if (timeSpent > 0 && activeUrl) {
    chrome.runtime.sendMessage({
      type: 'TIME_UPDATE',
      url: activeUrl,
      timeSpent: timeSpent
    });
    lastUpdateTime = now;
  }
}

// Listen for active tab changes
chrome.tabs.onActivated.addListener(activeInfo => {
  activeTabId = activeInfo.tabId;
  lastUpdateTime = Date.now();
  chrome.tabs.get(activeTabId, tab => {
    if (tab.url) {
      try {
        activeUrl = new URL(tab.url).hostname;
      } catch (e) {
        activeUrl = null;
      }
    }
  });
});

// Update activeUrl when the URL of the active tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    try {
      activeUrl = new URL(changeInfo.url).hostname;
    } catch (e) {
      activeUrl = null;
    }
    lastUpdateTime = Date.now();
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus pause tracking
    activeUrl = null;
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, tabs => {
      if (tabs.length > 0) {
        activeTabId = tabs[0].id;
        try {
          activeUrl = new URL(tabs[0].url).hostname;
        } catch (e) {
          activeUrl = null;
        }
        lastUpdateTime = Date.now();
      }
    });
  }
});

// Update time every second
setInterval(updateTime, 1000);
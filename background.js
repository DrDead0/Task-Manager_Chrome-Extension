// In background.js:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "createAlarm") {
      chrome.alarms.create(message.title, { when: message.dueDate.getTime() });
    }
  });
  
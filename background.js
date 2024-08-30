let lastData = {};

async function initializeLastData() {
  try {
    const response = await fetch('https://vtfs3l2lzp4nzffidgv4hyrhfq0ljscb.lambda-url.us-west-2.on.aws/');
    const data = await response.json();

    // Store the initial JSON blob
    lastData = data;
  } catch (error) {
    console.error('Error initializing lastData:', error);
  }
}

async function checkForUpdates() {
  try {
    const response = await fetch('https://vtfs3l2lzp4nzffidgv4hyrhfq0ljscb.lambda-url.us-west-2.on.aws/');
    const data = await response.json();

    // Compare the current JSON blob with the last one
    if (JSON.stringify(data) !== JSON.stringify(lastData)) {
      lastData = data;
      chrome.notifications.create({
        type: 'basic',
        iconUrl: `${data.iconUrl}`,
        title: `${data.title}`,
        message: `${data.message}`,
        priority: 2,
        requireInteraction: true,
        isClickable: true,
        contextMessage: `${data.contextMessage}`,
        eventTime: Date.now(),
        silent: false,
        buttons: [
          { title: `${data.actionButton}` },
          { title: "Dismiss" }
        ]
      });
    }
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

// Initialize lastData on extension load
initializeLastData().then(() => {
  // Poll every 30s
  chrome.alarms.create('checkJSON', { periodInMinutes: .5 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkJSON') {
      checkForUpdates();
    }
  });

  // Listen for button clicks in the notification
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
      // Open stream when button is clicked
      chrome.tabs.create({ url: lastData.actionUrl });
    }
  });
});

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open stream if they click on the notification
  chrome.tabs.create({ url: lastData.actionUrl });
  
  // Clear the notification if clicked
  chrome.notifications.clear(notificationId);
});

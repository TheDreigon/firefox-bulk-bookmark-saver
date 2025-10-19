// background.js - Main extension logic

// Create context menu on install
browser.runtime.onInstalled.addListener(() => {
  try {
    browser.contextMenus.create({
      id: "save-selected-tabs",
      title: "Save selected tabs to bookmarks",
      contexts: ["tab"],
      icons: {
        "16": "icon.png"
      }
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

// Listener for context menu (for saving selected tabs)
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-selected-tabs") {
    await saveSelectedTabs();
  }
});

// Function to save selected tabs
async function saveSelectedTabs() {
  try {
    const settings = await browser.storage.local.get(['defaultFolder', 'alwaysAsk']);
    const highlightedTabs = await browser.tabs.query({ highlighted: true, currentWindow: true });
    
    if (highlightedTabs.length === 0) {
      browser.notifications.create({
        type: 'basic',
        title: 'No Tabs Selected',
        message: 'Please select one or more tabs first (Ctrl+Click to select multiple tabs).'
      });
      return;
    }
    
    // If "always ask" is enabled OR no default folder set, we need to let user choose
    if (settings.alwaysAsk || !settings.defaultFolder) {
      // Store selected tab IDs temporarily
      await browser.storage.local.set({ pendingTabIds: highlightedTabs.map(t => t.id) });
      
      // Open the popup in a small popup window
      await browser.windows.create({
        url: browser.runtime.getURL('popup.html?mode=context'),
        type: 'popup',
        width: 420,
        height: 550,
        allowScriptsToClose: true
      });
      return;
    }
    
    // Use default folder (only if "always ask" is OFF and folder is set)
    await saveTabsToFolder(highlightedTabs, settings.defaultFolder);
    
  } catch (error) {
    console.error('Error saving selected tabs:', error);
    browser.notifications.create({
      type: 'basic',
      title: 'Error Saving Tabs',
      message: `Failed to save tabs: ${error.message}`
    });
  }
}

// Helper function to save tabs to a specific folder
async function saveTabsToFolder(tabs, folderId) {
  // Create folder for selected tabs
  const folderName = `${tabs.length} tabs - ${new Date().toLocaleString()}`;
  const folder = await browser.bookmarks.create({
    parentId: folderId,
    title: folderName
  });
  
  // Save selected tabs
  let savedCount = 0;
  for (const tab of tabs) {
    if (!tab.url.startsWith('about:')) {
      await browser.bookmarks.create({
        parentId: folder.id,
        title: tab.title,
        url: tab.url
      });
      savedCount++;
    }
  }
  
  // Success notification
  browser.notifications.create({
    type: 'basic',
    title: 'Tabs Saved',
    message: `${savedCount} of ${tabs.length} tabs saved successfully to "${folderName}"!`
  });
}

// Function to get "Other Bookmarks" folder
async function getOtherBookmarksFolder() {
  try {
    const bookmarkTree = await browser.bookmarks.getTree();
    const otherBookmarks = findOtherBookmarks(bookmarkTree[0]);
    return otherBookmarks ? otherBookmarks.id : null;
  } catch (error) {
    console.error('Error getting Other Bookmarks folder:', error);
    return null;
  }
}

// Helper function to find "Other Bookmarks"
function findOtherBookmarks(node) {
  if (node.title === 'Other Bookmarks' || node.title === 'Outros marcadores' || node.title === 'Outros Favoritos') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findOtherBookmarks(child);
      if (found) return found;
    }
  }
  return null;
}
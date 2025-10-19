// popup.js - Popup logic for folder selection

// Check if running on mobile (where window API might not work properly)
function isMobile() {
  return typeof browser.windows === 'undefined';
}

// Check if we're in context menu mode (opened as a tab)
function isContextMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mode') === 'context';
}

// Load bookmark folders into the select element
async function loadBookmarkFolders() {
  const select = document.getElementById('folderSelect');
  select.innerHTML = '';
  
  const bookmarkTree = await browser.bookmarks.getTree();
  const settings = await browser.storage.local.get(['defaultFolder']);
  
  // Recursively add all folders
  function addFolders(nodes, level = 0, isRoot = false) {
    for (const node of nodes) {
      if (node.type === 'folder' || !node.url) {
        // Skip the root folder and Mobile Bookmarks
        if (isRoot || node.title === 'Mobile Bookmarks' || node.title === 'Marcadores móveis') {
          // Process children but don't add the folder itself
          if (node.children) {
            addFolders(node.children, level, false);
          }
          continue;
        }
        
        const option = document.createElement('option');
        option.value = node.id;
        const indent = '\u00A0\u00A0'.repeat(level);
        
        // Better naming for folders without a title
        let displayName = node.title || '(No name)';
        
        option.textContent = indent + displayName;
        
        // Pre-select the default folder if it exists
        if (settings.defaultFolder && node.id === settings.defaultFolder) {
          option.selected = true;
        }
        
        select.appendChild(option);
        
        if (node.children) {
          addFolders(node.children, level + 1, false);
        }
      }
    }
  }
  
  addFolders(bookmarkTree, 0, true);
}

// Save tabs to selected folder and close window
async function saveAndClose() {
  const select = document.getElementById('folderSelect');
  const selectedFolderId = select.value;
  
  if (!selectedFolderId) {
    alert('Please select a folder');
    return;
  }
  
  // Get the checkbox state and save it
  const closeWindowCheckbox = document.getElementById('closeWindowCheckbox');
  const shouldCloseWindow = closeWindowCheckbox.checked;
  
  // Save the preference
  await browser.storage.local.set({ closeWindowAfterSaving: shouldCloseWindow });
  
  try {
    // Check if we're in context menu mode
    if (isContextMode()) {
      // Get pending tab IDs from storage
      const { pendingTabIds } = await browser.storage.local.get('pendingTabIds');
      
      if (!pendingTabIds || pendingTabIds.length === 0) {
        alert('No tabs were selected');
        window.close();
        return;
      }
      
      // Get the actual tab objects
      const tabs = await Promise.all(
        pendingTabIds.map(id => browser.tabs.get(id).catch(() => null))
      );
      const validTabs = tabs.filter(t => t !== null);
      
      // Create folder with current date
      const folderName = `${validTabs.length} tabs - ${new Date().toLocaleString()}`;
      const folder = await browser.bookmarks.create({
        parentId: selectedFolderId,
        title: folderName
      });
      
      // Save all tabs
      let savedCount = 0;
      for (const tab of validTabs) {
        if (!tab.url.startsWith('about:')) {
          await browser.bookmarks.create({
            parentId: folder.id,
            title: tab.title,
            url: tab.url
          });
          savedCount++;
        }
      }
      
      // Clean up pending tabs
      await browser.storage.local.remove('pendingTabIds');
      
      // Show notification
      await browser.notifications.create({
        type: 'basic',
        title: 'Tabs Saved',
        message: `${savedCount} tabs saved successfully to "${folderName}"`
      });
      
      // Close this popup window
      const currentWindow = await browser.windows.getCurrent();
      await browser.windows.remove(currentWindow.id);
      return;
    }
    
    // Normal mode - save all tabs in current window
    // Check if we're on mobile or desktop
    if (isMobile()) {
      await browser.notifications.create({
        type: 'basic',
        title: 'Not Supported',
        message: 'This extension is designed for Firefox Desktop only.'
      });
      window.close();
      return;
    }
    
    const currentWindow = await browser.windows.getCurrent();
    const tabs = await browser.tabs.query({ windowId: currentWindow.id });
    
    // Create folder with current date
    const folderName = `Window - ${new Date().toLocaleString()}`;
    const folder = await browser.bookmarks.create({
      parentId: selectedFolderId,
      title: folderName
    });
    
    // Save all tabs
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
    
    // Show success notification
    await browser.notifications.create({
      type: 'basic',
      title: 'Tabs Saved',
      message: `${savedCount} tabs saved successfully to "${folderName}"`
    });
    
    // Close the window only if checkbox is checked
    if (shouldCloseWindow) {
      await browser.windows.remove(currentWindow.id);
    } else {
      // Just close the popup
      window.close();
    }
    
  } catch (error) {
    console.error('Error saving tabs:', error);
    alert(`Failed to save tabs: ${error.message}\n\nCheck the browser console for more details.`);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check mobile first
    if (isMobile() && !isContextMode()) {
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;">This extension is designed for Firefox Desktop only.</div>';
      return;
    }
    
    await loadBookmarkFolders();
    
    // Load the "close window" preference (default to true)
    const { closeWindowAfterSaving } = await browser.storage.local.get('closeWindowAfterSaving');
    const shouldClose = closeWindowAfterSaving !== undefined ? closeWindowAfterSaving : true;
    document.getElementById('closeWindowCheckbox').checked = shouldClose;
    
    // Update button text based on checkbox state
    const updateButtonText = () => {
      const checkbox = document.getElementById('closeWindowCheckbox');
      const button = document.getElementById('saveButton');
      if (isContextMode()) {
        button.textContent = 'Save Selected Tabs';
      } else {
        button.textContent = checkbox.checked ? 'Save & Close Window' : 'Save Bookmarks';
      }
    };
    
    updateButtonText();
    
    // Update button text when checkbox changes
    document.getElementById('closeWindowCheckbox').addEventListener('change', updateButtonText);
    
    // Check if we're in context menu mode
    if (isContextMode()) {
      // In context mode, always show the folder selector
      // Hide the close window checkbox since it doesn't apply to context menu
      document.querySelector('.option-group').style.display = 'none';
      
      document.getElementById('saveButton').addEventListener('click', saveAndClose);
      
      // Handle Enter key
      document.getElementById('folderSelect').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveAndClose();
        }
      });
      
      document.getElementById('createFolderButton').addEventListener('click', createNewFolder);
      return;
    }
    
    // Normal mode - check if "always ask" is enabled
    const settings = await browser.storage.local.get(['alwaysAsk', 'defaultFolder']);
    
    // If "always ask" is NOT enabled AND there's a default folder, auto-save
    if (!settings.alwaysAsk && settings.defaultFolder) {
      document.getElementById('folderSelect').value = settings.defaultFolder;
      await saveAndClose();
      return;
    }
    
    // Otherwise, let user choose (either "always ask" is on, or no default folder set)
    document.getElementById('saveButton').addEventListener('click', saveAndClose);
    document.getElementById('createFolderButton').addEventListener('click', createNewFolder);
    
    // Handle Enter key
    document.getElementById('folderSelect').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveAndClose();
      }
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
});

// Function to create a new folder
async function createNewFolder() {
  const folderName = prompt('Enter name for new folder:');
  
  if (!folderName || folderName.trim() === '') {
    return;
  }
  
  try {
    const select = document.getElementById('folderSelect');
    const currentSelection = select.value;
    
    // If a folder is selected, create inside it; otherwise use Bookmarks Menu
    let parentId = currentSelection;
    if (!parentId) {
      // Find Bookmarks Menu as default parent
      const bookmarkTree = await browser.bookmarks.getTree();
      const bookmarksMenu = findBookmarksMenu(bookmarkTree[0]);
      parentId = bookmarksMenu ? bookmarksMenu.id : bookmarkTree[0].id;
    }
    
    // Create the new folder
    const newFolder = await browser.bookmarks.create({
      parentId: parentId,
      title: folderName.trim()
    });
    
    // Reload the folder list and select the new folder
    await loadBookmarkFolders();
    document.getElementById('folderSelect').value = newFolder.id;
    
  } catch (error) {
    console.error('Error creating folder:', error);
    alert(`Failed to create folder: ${error.message}`);
  }
}

// Helper function to find Bookmarks Menu
function findBookmarksMenu(node) {
  if (node.title === 'Bookmarks Menu' || node.title === 'Menu de marcadores') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findBookmarksMenu(child);
      if (found) return found;
    }
  }
  return null;
}
// options.js - Settings management

// Load bookmark folders
async function loadBookmarkFolders() {
  const select = document.getElementById('folderSelect');
  select.innerHTML = '';
  
  const bookmarkTree = await browser.bookmarks.getTree();
  
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
        select.appendChild(option);
        
        if (node.children) {
          addFolders(node.children, level + 1, false);
        }
      }
    }
  }
  
  addFolders(bookmarkTree, 0, true);
}

// Load saved settings
async function loadSettings() {
  const settings = await browser.storage.local.get(['defaultFolder', 'alwaysAsk', 'closeWindowAfterSaving']);
  
  if (settings.defaultFolder) {
    document.getElementById('folderSelect').value = settings.defaultFolder;
  }
  
  // Default to "always ask" being checked if no settings exist
  const alwaysAsk = settings.alwaysAsk !== undefined ? settings.alwaysAsk : true;
  document.getElementById('alwaysAsk').checked = alwaysAsk;
  
  // Default to "close window" being checked
  const closeWindow = settings.closeWindowAfterSaving !== undefined ? settings.closeWindowAfterSaving : true;
  document.getElementById('closeWindow').checked = closeWindow;
}

// Save settings
async function saveSettings() {
  const folderSelect = document.getElementById('folderSelect');
  const alwaysAsk = document.getElementById('alwaysAsk').checked;
  const closeWindow = document.getElementById('closeWindow').checked;
  
  await browser.storage.local.set({
    defaultFolder: folderSelect.value,
    alwaysAsk: alwaysAsk,
    closeWindowAfterSaving: closeWindow
  });
  
  // Show success message
  const status = document.getElementById('status');
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadBookmarkFolders();
  await loadSettings();
  
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  
  // Update folder state when "always ask" changes
  document.getElementById('alwaysAsk').addEventListener('change', (e) => {
    document.getElementById('folderSelect').disabled = e.target.checked;
  });
});
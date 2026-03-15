# Bulk Bookmark Saver - Firefox Extension

Firefox extension that allows you to save multiple tabs as bookmarks quickly and easily.

## 📋 Features

1. **Save entire window**: Click the extension icon to save all tabs in the current window
2. **Optional window closing**: Choose whether to close the window after saving
3. **Save selected tabs**: Select multiple tabs (Ctrl+click), right-click and choose "Save selected tabs to bookmarks"
4. **Flexible folder selection**: Set a default folder or choose to be asked every time
5. **Create folders on-the-fly**: Create new bookmark folders directly from the popup
6. **Automatic organization**: All tabs are saved in folders with date and time stamps

## 🔧 Installation

### For Testing (Temporary Installation)

1. Create a folder on your computer (e.g., `BulkBookmarkSaver`)

2. Save the following files in that folder:
   - `manifest.json`
   - `background.js`
   - `popup.html`
   - `popup.js`
   - `options.html`
   - `options.js`
   - `icon.png`

3. In Firefox, go to `about:debugging`

4. Click "This Firefox" (in the sidebar)

5. Click "Load Temporary Add-on..."

6. Navigate to the folder and select `manifest.json`

7. The extension is now installed! (Note: temporary installations are removed when Firefox closes)

## 🎯 How to Use

### Save all tabs in current window:
1. Click the extension icon in the toolbar
2. Choose destination folder (or it uses your default)
3. Optionally enable "Close window after saving current tabs"
4. Click "Save & Close Window" or "Save Bookmarks"

### Save selected tabs:
1. Select multiple tabs:
   - **Ctrl + click**: select individual tabs
   - **Shift + click**: select a range of tabs
2. Right-click on any selected tab
3. Choose "Save selected tabs to bookmarks"
4. A small popup window will open for you to choose the destination folder

### Configure settings:
1. Right-click the extension icon → "Manage Extension" → "Options"
2. Or go to `about:addons` → Bulk Bookmark Saver → Options
3. Set your default bookmark folder
4. Choose whether to always ask where to save
5. Choose whether to close window by default when using toolbar button

## 📁 File Structure

```
BulkBookmarkSaver/
├── manifest.json          # Extension configuration
├── background.js          # Background logic (context menu, event handlers)
├── popup.html             # Popup interface (when clicking extension icon)
├── popup.js               # Popup logic
├── options.html           # Settings interface
├── options.js             # Settings logic
└── icon.png               # Extension icon
```

## ⚙️ Settings Explained

**Default folder to save bookmarks:**
- Choose which bookmark folder to use by default
- If not set, you'll always be asked to choose

**Always ask where to save:**
- When enabled: Always shows folder picker
- When disabled: Uses default folder automatically

**Close window after saving all tabs (toolbar button only):**
- When enabled: Closes the window after saving all tabs via toolbar button
- When disabled: Keeps window open after saving
- This setting only applies when using the toolbar button, not the context menu

## 🔒 Privacy

This extension does not collect, store, or transmit any user data. All operations are performed locally in your browser. No information is sent to external servers.

## 💡 Tips

- Internal Firefox pages (`about:*`) are automatically skipped and not saved
- Each set of tabs is saved in a folder with current date and time
- You can organize saved folders manually in your bookmarks afterwards
- The extension works best with Firefox Desktop (not compatible with Firefox Android)

## ⚠️ Compatibility

- **Firefox Desktop**: ✅ Fully supported (Firefox 91+)
- **Firefox Android**: ❌ Not yet supported

## 🐛 Troubleshooting

**Extension doesn't appear:**
- Verify all files are in the same folder
- Check that `manifest.json` is correct
- Reload the extension in `about:debugging`

**Icon doesn't appear:**
- Make sure `icon.png` exists in the extension folder
- Any PNG image will work for testing

**Tabs not saving:**
- Check extension permissions in `about:addons`
- Open browser console (`Ctrl+Shift+J`) for error details
- Verify you have a default folder set or "Always ask" enabled

**Popup window too small/large:**
- The popup window size is fixed at 420x550 pixels
- This is optimized for the folder selection interface

## 🔄 Version History

### v1.0.0 (Initial Release)
- Save all tabs in window with one click
- Save selected tabs via context menu
- Configurable default folder
- Optional "always ask" mode
- Optional window closing
- Create folders on-the-fly
- Automatic date/time stamping

## 📝 License

- *MIT License for open source*

---

Made with ❤️ to make tab management easier!

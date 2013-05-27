## Brackets Bookmarks Extension

This is a [Brackets](https://github.com/adobe/brackets) extension that allows the user to navigate within a document using bookmarks.

## Installation

1. [Download](https://github.com/toshsharma/brackets-bookmarks/zipball/master) and unzip it; or clone this repo on GitHub
2. Copy the copied/cloned folder into the Brackets `extensions/user` folder. The extensions folder can be found via `Help` > `Show Extensions Folder`
3. Restart Brackets

**Compatible with Brackets Sprint 25**

## Usage

Bookmarks can be set using either keyboard shortcuts or entries under the Navigate menu.

### Keyboard Shortcuts

- Toggle Bookmark: `Cmd-F4` (Mac) or `Ctrl-F4` (Win)
- Next Bookmark: `F4`
- Previous Bookmark: `Shift-F4`
- Clear Bookmarks: `Cmd-Shift-F4` (Mac) or `Ctrl-Shift-F4`

### Notes

- Bookmarks can be set on individual lines (one bookmark per line)
- Bookmarks are cleared when an open document is updated outside of Brackets (causing the document to be reloaded within Brackets)

## Future

1. Persistent bookmarks (restore bookmarks when files are reopened)
2. API to let other extensions set/remove/query bookmarks
3. Bookmarks at specific character positions within lines

## Dependencies

CodeMirror 3

## Screenshot

<img style="max-width: 100%;" src="https://raw.github.com/toshsharma/brackets-bookmarks/master/screenshot.png" />

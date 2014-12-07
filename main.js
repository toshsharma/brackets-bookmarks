/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Extension to allow a user to navigate within a document using bookmarks */

define(function (require, exports, module) {
    'use strict';

    var CommandManager    = brackets.getModule("command/CommandManager"),
        Menus             = brackets.getModule("command/Menus"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        DocumentManager   = brackets.getModule("document/DocumentManager"),
        EditorManager     = brackets.getModule("editor/EditorManager"),
        AppInit           = brackets.getModule("utils/AppInit");
    
    var _documentBookmarks = {};
    var _activeDocument = null;
    var _activeBookmarks = [];
    var _activeEditor = null;
    
    function toggleBookmark() {
        function addBookmark(editor, pos) {
            var _codeMirror = editor._codeMirror;
            var bookmark = _codeMirror.setBookmark({line: pos.line, ch: 0 }); // Only one bookmark per line
            
            _activeBookmarks.push({ originalLineNum: pos.line, ch: 0, bookmark: bookmark });
            _activeBookmarks.sort(function (a, b) {
                return a.originalLineNum - b.originalLineNum;
            });
    
            var marker = _codeMirror.addLineClass(pos.line, null, "toshsharma-bookmarks-bookmark"); // This marker is automatically tracked/updated by CodeMirror, when lines are added to/removed from the document.
        }

        function removeBookmark(editor, pos) {
            var linenum = pos.line;
            var _codeMirror = editor._codeMirror;
            var i = 0;

            for (i = 0; i < _activeBookmarks.length; i++) {
                var bookmark = _activeBookmarks[i].bookmark;
                var bmLinenum = bookmark.find().line;
                if (bmLinenum === linenum) {
                    bookmark.clear();
                    _codeMirror.removeLineClass(pos.line, null, "toshsharma-bookmarks-bookmark");
                    _activeBookmarks.splice(i, 1);
                    break;
                }
            }
        }

        var editor = EditorManager.getCurrentFullEditor();
        var _codeMirror = editor._codeMirror;
        var pos    = _codeMirror.getCursor();
        var line   = pos.line;

        var lineInfo = _codeMirror.lineInfo(line);
        var markerClass = lineInfo.wrapClass;
        if (markerClass && markerClass.indexOf("toshsharma-bookmarks-bookmark") > -1) {
            removeBookmark(editor, pos);
        } else {
            addBookmark(editor, pos);
        }
    }
    
    function jumpToLine(_activeEditor, linenum) {
        _activeEditor.setCursorPos({ line: linenum, ch: 0 });
		_activeEditor.centerOnCursor();

		var _codeMirror = _activeEditor._codeMirror;
        _codeMirror.addLineClass(linenum, "wrap", "toshsharma-bookmarks-flash");
        window.setTimeout(function () {
            _codeMirror.removeLineClass(linenum, "wrap", "toshsharma-bookmarks-flash");
        }, 300);
    }

    function nextBookmark() {
        if (_activeBookmarks.length === 0) {
            return;
        }
        
        var _codeMirror = _activeEditor._codeMirror;
        var currentLinenum = _codeMirror.getCursor().line;
        var i = 0;

        var found = false;
        for (i = 0; i < _activeBookmarks.length; i++) {
            var bookmark = _activeBookmarks[i].bookmark;
            var pos = bookmark.find();
            if (pos) {
                var linenum = pos.line;
                if (linenum > currentLinenum) {
                    jumpToLine(_activeEditor, linenum);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            var firstBookmarkPos = _activeBookmarks[0].bookmark.find();
            if (firstBookmarkPos) {
                jumpToLine(_activeEditor, firstBookmarkPos.line)
            }
        }
    }

    function previousBookmark() {
        if (_activeBookmarks.length === 0) {
            return;
        }
        
        var _codeMirror = _activeEditor._codeMirror;
        var currentLinenum = _codeMirror.getCursor().line;
        var i = 0;

        var found = false;
        for (i = _activeBookmarks.length - 1; i >= 0; i--) {
            var bookmark = _activeBookmarks[i].bookmark;
            var pos = bookmark.find();
            if (pos) {
                var linenum = pos.line;
                if (linenum < currentLinenum) {
                    jumpToLine(_activeEditor, linenum);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            var lastBookmarkPos = _activeBookmarks[_activeBookmarks.length - 1].bookmark.find();
            if (lastBookmarkPos) {
                jumpToLine(_activeEditor, lastBookmarkPos.line);
            }
        }
    }

    function clearBookmarks() {
        var _codeMirror = _activeEditor._codeMirror;
        var i = 0;
        
        for (i = 0; i < _activeBookmarks.length; i++) {
            var bookmark = _activeBookmarks[i].bookmark;
            var pos = bookmark.find();
            if (pos) {
                _codeMirror.removeLineClass(pos.line, null, "toshsharma-bookmarks-bookmark");
            }
            bookmark.clear();
        }
        _activeBookmarks.length = 0;
    }
            
    function currentDocumentChanged() {
        _activeEditor = EditorManager.getCurrentFullEditor();
        _activeDocument = DocumentManager.getCurrentDocument();
        if (_activeDocument) {
            _activeBookmarks = _documentBookmarks[_activeDocument.url] || [];
            _documentBookmarks[_activeDocument.url] = _activeBookmarks;
        }
    }

    function addStyles() {
        var cssText = ".toshsharma-bookmarks-bookmark .CodeMirror-linenumber { background-color: #80C7F7 !important; color: #000 !important; border-radius: 2px !important; }" +
            "@-webkit-keyframes toshsharma-bookmarks-flash { from { background: #A0D7F7; } to { background: inherit; } }" +
            ".CodeMirror .toshsharma-bookmarks-flash { -webkit-animation: toshsharma-bookmarks-flash 0.3s; }";
        $("<style>").text(cssText).appendTo(window.document.head);
    }
    
    function addMenuCommands() {
        var navigateMenu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU);
        navigateMenu.addMenuDivider();
        
        function registerCommandHandler(commandId, menuName, handler, shortcut) {
            CommandManager.register(menuName, commandId, handler);
            navigateMenu.addMenuItem(commandId);
            KeyBindingManager.addBinding(commandId, shortcut);
        }
        
        registerCommandHandler("toshsharma.bookmarks.toggleBookmark",   "Toggle Bookmark",   toggleBookmark,   "Ctrl-F4");
        registerCommandHandler("toshsharma.bookmarks.nextBookmark",     "Next Bookmark",     nextBookmark,     "F4");
        registerCommandHandler("toshsharma.bookmarks.previousBookmark", "Previous Bookmark", previousBookmark, "Shift-F4");
        registerCommandHandler("toshsharma.bookmarks.clearBookmarks",   "Clear Bookmarks",   clearBookmarks,   "Ctrl-Shift-F4");
    }

    function addHandlers() {
        $(DocumentManager).on("currentDocumentChange", currentDocumentChanged);
    }

    function load() {
        addStyles();
        addMenuCommands();
        addHandlers();

        currentDocumentChanged(); // Load up the currently open document
    }
    
    AppInit.appReady(function () {
        load();
    });
});

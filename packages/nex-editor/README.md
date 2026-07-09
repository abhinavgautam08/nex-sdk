# `<nex-editor>` Rich Text & Markdown Editor

`<nex-editor>` is a native WYSIWYG editor containing formatting controls, markdown converters, history states (Undo / Redo), and content export buttons.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-editor/nex-editor.min.js"></script>
```

## HTML Usage
```html
<nex-editor></nex-editor>
```

## API Reference
*   **Attributes**:
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `getHtml()`: Returns current editor markup.
    *   `getMarkdown()`: Compiles and returns Markdown plain text.
    *   `setMarkdown(string)`: Parses and renders Markdown inputs inside the editor workspace.
    *   `undo()`: Reverts one history step.
    *   `redo()`: Restores one reverted step.
*   **Events**:
    *   `change`: Dispatched on document changes.
    *   `export`: Dispatched when the user clicks Export HTML or Export MD.

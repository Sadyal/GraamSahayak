/**
 * Restricts keypress events to numeric digits only for fields like Phone Number.
 * Allows control keys: Backspace, Delete, Tab, Escape, Enter, Arrow keys, Copy/Paste/Cut/Undo shortcuts.
 */
export const restrictToNumeric = (e) => {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
  ];

  // Allow standard control keys
  if (allowedKeys.includes(e.key)) {
    return;
  }

  // Allow standard Ctrl / Cmd shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
    return;
  }

  // Block any non-numeric key press
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Restricts keypress events to alphabets and spaces only for fields like Names.
 */
export const restrictToAlphabetic = (e) => {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End'
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
    return;
  }

  // Block non-alphabet and non-space characters
  if (!/^[a-zA-Z\s]$/.test(e.key)) {
    e.preventDefault();
  }
};

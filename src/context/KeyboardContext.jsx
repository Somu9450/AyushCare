import React, { createContext, useCallback, useContext, useState } from 'react';

const KeyboardContext = createContext(null);

export const KeyboardProvider = ({ children }) => {
  const [activeInput, setActiveInput] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openKeyboard = useCallback((config) => {
    setActiveInput({
      id: config.id || 'kiosk-input',
      value: String(config.value ?? ''),
      onChange: config.onChange || (() => {}),
      type: config.type || 'text',
      placeholder: config.placeholder || '',
      label: config.label || '',
      onEnter: config.onEnter || null,
      maxLength: config.maxLength,
      allowDecimal: config.allowDecimal !== false,
    });
    setIsOpen(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setIsOpen(false);
    setActiveInput(null);
  }, []);

  const handleKeyPress = useCallback((key) => {
    if (!activeInput) return;
    const currentVal = String(activeInput.value || '');
    let nextVal = currentVal;

    if (key === 'BACKSPACE') nextVal = currentVal.slice(0, -1);
    else if (key === 'CLEAR') nextVal = '';
    else if (key === 'SPACE') nextVal = currentVal + ' ';
    else if (key === 'ENTER') {
      activeInput.onEnter?.(currentVal);
      closeKeyboard();
      return;
    } else {
      if ((activeInput.type === 'number' || activeInput.type === 'tel') && !/^\d$/.test(key) && !(key === '.' && activeInput.allowDecimal)) return;
      if (activeInput.maxLength && nextVal.length >= activeInput.maxLength) return;
      nextVal = currentVal + key;
    }

    if (activeInput.maxLength) nextVal = nextVal.slice(0, activeInput.maxLength);
    activeInput.onChange(nextVal);
    setActiveInput((prev) => (prev ? { ...prev, value: nextVal } : null));
  }, [activeInput, closeKeyboard]);

  return (
    <KeyboardContext.Provider value={{ isOpen, activeInput, openKeyboard, closeKeyboard, handleKeyPress }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) throw new Error('useKeyboard must be used within KeyboardProvider');
  return context;
};

export default KeyboardContext;

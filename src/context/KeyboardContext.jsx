import React, { createContext, useContext, useState, useCallback } from 'react';

const KeyboardContext = createContext(null);

export const KeyboardProvider = ({ children }) => {
  const [activeInput, setActiveInput] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openKeyboard = useCallback((config) => {
    setActiveInput({
      id: config.id || 'kiosk-input',
      value: config.value || '',
      onChange: config.onChange || (() => {}),
      type: config.type || 'text', // 'text' | 'number' | 'tel'
      placeholder: config.placeholder || '',
      label: config.label || '',
      onEnter: config.onEnter || null,
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

    if (key === 'BACKSPACE') {
      nextVal = currentVal.slice(0, -1);
    } else if (key === 'CLEAR') {
      nextVal = '';
    } else if (key === 'SPACE') {
      nextVal = currentVal + ' ';
    } else if (key === 'ENTER') {
      if (activeInput.onEnter) {
        activeInput.onEnter(currentVal);
      }
      closeKeyboard();
      return;
    } else {
      nextVal = currentVal + key;
    }

    activeInput.onChange(nextVal);
    setActiveInput((prev) => (prev ? { ...prev, value: nextVal } : null));
  }, [activeInput, closeKeyboard]);

  return (
    <KeyboardContext.Provider
      value={{
        isOpen,
        activeInput,
        openKeyboard,
        closeKeyboard,
        handleKeyPress,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};

export default KeyboardContext;

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useKioskStore } from '../../store/useKioskStore';
import { OFFICIAL_INDIAN_LANGUAGES } from '../../constants/indianLanguages';

export default function LanguageToggle() {
  const { language, setLanguage } = useKioskStore();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const selectorRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selected =
    OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === language) ||
    OFFICIAL_INDIAN_LANGUAGES.find((l) => l.code === 'en');

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = Math.min(350, window.innerWidth - 24);
    const gap = 10;

    let left = rect.right - menuWidth;
    left = Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12));

    let top = rect.bottom + gap;
    const maxHeight = Math.min(520, Math.max(260, window.innerHeight - top - 12));

    // If there is not enough room below, open upward.
    if (maxHeight < 300 && rect.top > 320) {
      const estimatedHeight = Math.min(520, window.innerHeight - 24);
      top = Math.max(12, rect.top - estimatedHeight - gap);
    }

    setMenuPosition({
      top,
      left,
      width: menuWidth,
      maxHeight: Math.min(
        520,
        Math.max(240, window.innerHeight - top - 12)
      ),
    });
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleViewportChange = () => updateMenuPosition();

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      const target = event.target;

      if (
        selectorRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  const languageMenu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            className="language-menu language-menu-portal"
            role="listbox"
            aria-label="Select language"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: menuPosition.maxHeight,
            }}
          >
            <div className="language-menu-header">
              <span>Select language</span>
            </div>

            <div className="language-menu-list">
              {OFFICIAL_INDIAN_LANGUAGES.map((l) => {
                const isSelected = l.code === language;

                return (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`language-option ${
                      isSelected ? 'active' : ''
                    }`}
                    onClick={() => handleLanguageChange(l.code)}
                  >
                    <span className="language-option-text">
                      <span className="language-native">{l.native}</span>
                      <span className="language-name">{l.name}</span>
                    </span>

                    {isSelected && (
                      <Check
                        size={19}
                        className="language-check"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={selectorRef} className="language-selector">
      <button
        ref={buttonRef}
        type="button"
        className={`kiosk-language ${open ? 'open' : ''}`}
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages size={19} aria-hidden="true" />

        <span className="selected-language">
          {selected?.native || 'English'}
        </span>

        <ChevronDown
          size={17}
          className={`language-chevron ${open ? 'rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      {languageMenu}
    </div>
  );
}

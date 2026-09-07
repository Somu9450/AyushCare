import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { createPortal } from "react-dom";
import useMobileStore from "../../store/useMobileStore";
import { OFFICIAL_INDIAN_LANGUAGES } from "../../constants/indianLanguages";

export default function LanguageSwitcher({ floating = false }) {
  const { selectedLanguage, setSelectedLanguage } = useMobileStore();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selected =
    OFFICIAL_INDIAN_LANGUAGES.find((item) => item.code === selectedLanguage) ||
    OFFICIAL_INDIAN_LANGUAGES.find((item) => item.code === "en");

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    const right = Math.max(12, window.innerWidth - rect.right);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    setPosition({
      top: Math.min(rect.bottom + 8, window.innerHeight - 120),
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, selectedLanguage]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event) => {
      if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleViewportChange = () => updatePosition();

    document.addEventListener("pointerdown", handleOutside);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            className="mobile-language-menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            role="listbox"
            aria-label="Select language"
          >
            <div className="mobile-language-menu-title">
              Select language
            </div>

            <div className="mobile-language-list">
              {OFFICIAL_INDIAN_LANGUAGES.map((item) => {
                const active = item.code === selectedLanguage;

                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`mobile-language-option ${active ? "active" : ""}`}
                    onClick={() => {
                      setSelectedLanguage(item.code);
                      setOpen(false);
                    }}
                  >
                    <span className="mobile-language-native">{item.native}</span>
                    <span className="mobile-language-name">{item.name}</span>
                    {active && <Check size={18} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={floating ? "mobile-language-floating" : "mobile-language-control"}>
        <button
          ref={buttonRef}
          type="button"
          className="mobile-language-button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Change language. Current language: ${selected.name}`}
        >
          <Languages size={18} aria-hidden="true" />
          <span className="mobile-language-current">{selected.native}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={open ? "rotate-180" : ""}
          />
        </button>
      </div>
      {menu}
    </>
  );
}

import React, { useState } from 'react';
import { useKeyboard } from '../../context/KeyboardContext';
import {
  Delete,
  CornerDownLeft,
  X,
  RotateCcw,
  Check,
  Hash,
  Type,
  ChevronDown,
} from 'lucide-react';

const ROW_1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROW_2 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_3 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW_4 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

const SYMBOLS_ROW_1 = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
const SYMBOLS_ROW_2 = ['-', '_', '=', '+', '[', ']', '{', '}', '\\', '|'];
const SYMBOLS_ROW_3 = [';', ':', "'", '"', ',', '.', '<', '>', '/', '?'];

export const OnscreenKeyboard = () => {
  const { isOpen, activeInput, closeKeyboard, handleKeyPress } = useKeyboard();
  const [isShift, setIsShift] = useState(false);
  const [mode, setMode] = useState('alpha'); // 'alpha' | 'symbols' | 'numeric'

  if (!isOpen || !activeInput) return null;

  const isNumericOnly = activeInput.type === 'number' || activeInput.type === 'tel';

  const onKey = (char) => {
    handleKeyPress(char);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
      {/* Backdrop to close */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px] pointer-events-auto transition-opacity"
        onClick={closeKeyboard}
      />

      {/* Keyboard Container */}
      <div className="relative pointer-events-auto w-full max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-t-3xl border-t-2 border-teal-500/50 p-4 sm:p-6 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom duration-200 select-none">
        
        {/* Top bar with active field display */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-700/80">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{activeInput.label || 'Kiosk Input'}</span>
              <span className="text-slate-400 font-normal">({isNumericOnly ? 'Numbers' : 'Keyboard'})</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-bold text-white truncate mt-0.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center">
              <span>{activeInput.value || ''}</span>
              <span className="w-0.5 h-5 bg-teal-400 ml-1 animate-pulse" />
              {!activeInput.value && (
                <span className="text-slate-500 text-sm font-sans font-normal ml-1 truncate">
                  {activeInput.placeholder || 'Type here...'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Clear key */}
            <button
              type="button"
              onClick={() => handleKeyPress('CLEAR')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Mode switch */}
            {!isNumericOnly && (
              <button
                type="button"
                onClick={() => setMode(mode === 'symbols' ? 'alpha' : 'symbols')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                {mode === 'symbols' ? <Type className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                <span>{mode === 'symbols' ? 'ABC' : '?123'}</span>
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={closeKeyboard}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>

        {/* =======================================================
            NUMERIC MODE (if numeric only or switched)
        ======================================================== */}
        {isNumericOnly ? (
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', '.'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onKey(key)}
                  className="h-14 sm:h-16 text-2xl font-bold bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-white rounded-2xl border border-slate-700 shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={() => handleKeyPress('BACKSPACE')}
                className="h-13 bg-slate-800 hover:bg-rose-950/40 text-rose-300 rounded-2xl border border-slate-700 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Delete className="w-5 h-5" />
                <span>Backspace</span>
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('ENTER')}
                className="h-13 bg-teal-700 hover:bg-teal-600 text-white rounded-2xl border border-teal-600 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <CornerDownLeft className="w-5 h-5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        ) : (
          /* =======================================================
              QWERTY FULL KEYBOARD MODE
          ======================================================== */
          <div className="space-y-1.5 sm:space-y-2">
            {/* Numbers row */}
            <div className="flex justify-center gap-1 sm:gap-1.5">
              {(mode === 'symbols' ? SYMBOLS_ROW_1 : ROW_1).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onKey(key)}
                  className="flex-1 h-11 sm:h-13 max-w-[76px] bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-white font-bold text-base sm:text-lg rounded-xl border border-slate-700 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1 sm:gap-1.5">
              {(mode === 'symbols' ? SYMBOLS_ROW_2 : ROW_2).map((key) => {
                const displayKey = mode === 'alpha' && !isShift ? key.toLowerCase() : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onKey(displayKey)}
                    className="flex-1 h-11 sm:h-13 max-w-[76px] bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-white font-bold text-base sm:text-lg rounded-xl border border-slate-700 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    {displayKey}
                  </button>
                );
              })}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1 sm:gap-1.5 px-4 sm:px-6">
              {(mode === 'symbols' ? SYMBOLS_ROW_3 : ROW_3).map((key) => {
                const displayKey = mode === 'alpha' && !isShift ? key.toLowerCase() : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onKey(displayKey)}
                    className="flex-1 h-11 sm:h-13 max-w-[76px] bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-white font-bold text-base sm:text-lg rounded-xl border border-slate-700 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    {displayKey}
                  </button>
                );
              })}
            </div>

            {/* Row 4 with Shift & Backspace */}
            <div className="flex justify-center gap-1 sm:gap-1.5">
              {/* Shift Key */}
              <button
                type="button"
                onClick={() => setIsShift(!isShift)}
                className={`w-14 sm:w-20 h-11 sm:h-13 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  isShift
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                ⇧ {isShift ? 'CAPS' : 'Shift'}
              </button>

              {ROW_4.map((key) => {
                const displayKey = mode === 'alpha' && !isShift ? key.toLowerCase() : key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onKey(displayKey)}
                    className="flex-1 h-11 sm:h-13 max-w-[76px] bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-white font-bold text-base sm:text-lg rounded-xl border border-slate-700 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    {displayKey}
                  </button>
                );
              })}

              {/* Backspace Key */}
              <button
                type="button"
                onClick={() => handleKeyPress('BACKSPACE')}
                className="w-14 sm:w-20 h-11 sm:h-13 bg-slate-800 hover:bg-rose-950/50 text-rose-300 hover:text-white rounded-xl border border-slate-700 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Row: Spacebar & Actions */}
            <div className="flex justify-center gap-1.5 sm:gap-2 pt-1">
              <button
                type="button"
                onClick={() => onKey('.')}
                className="w-12 sm:w-16 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer active:scale-95"
              >
                .
              </button>

              <button
                type="button"
                onClick={() => onKey('@')}
                className="w-12 sm:w-16 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer active:scale-95"
              >
                @
              </button>

              {/* Spacebar */}
              <button
                type="button"
                onClick={() => handleKeyPress('SPACE')}
                className="flex-1 max-w-sm h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-teal-700 text-slate-300 font-semibold rounded-xl border border-slate-700 text-sm flex items-center justify-center cursor-pointer active:scale-98 transition-all"
              >
                Space
              </button>

              <button
                type="button"
                onClick={() => onKey('-')}
                className="w-12 sm:w-16 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-base flex items-center justify-center cursor-pointer active:scale-95"
              >
                -
              </button>

              {/* Enter / Submit */}
              <button
                type="button"
                onClick={() => handleKeyPress('ENTER')}
                className="w-24 sm:w-32 h-11 sm:h-12 bg-teal-700 hover:bg-teal-600 text-white font-black rounded-xl border border-teal-600 text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
              >
                <CornerDownLeft className="w-4 h-4" />
                <span>Enter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnscreenKeyboard;

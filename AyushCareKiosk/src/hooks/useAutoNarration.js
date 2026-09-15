import { useEffect } from 'react';
import { useKioskStore } from '../store/useKioskStore';
import audioService from '../services/audioService';

const collectPageText = () => {
  const root = document.querySelector('.kiosk-main-scroll');
  if (!root) return '';
  const clone = root.cloneNode(true);
  clone.querySelectorAll('script,style,[data-no-narrate],input,textarea').forEach((el) => el.remove());
  return clone.innerText?.replace(/\s+/g, ' ').trim() || '';
};

export default function useAutoNarration() {
  const { currentScreen, language, audioEnabled, sessionData } = useKioskStore();
  useEffect(() => {
    audioService.stop();
    if (!audioEnabled || !sessionData?.consultationId || currentScreen === 1 || currentScreen === 5 || currentScreen === 6) return;
    const timer = window.setTimeout(() => {
      void audioService.speakPage(sessionData.consultationId, collectPageText(), language).catch(() => {});
    }, 500);
    return () => { window.clearTimeout(timer); audioService.stop(); };
  }, [currentScreen, language, audioEnabled, sessionData?.consultationId]);
}

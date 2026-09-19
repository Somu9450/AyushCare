import { useEffect } from 'react';
import { useKioskStore } from '../store/useKioskStore';
import audioService from '../services/audioService';

/**
 * Confines automatic dictation / talk-back strictly to the active AI interview screen.
 * On all other screens (vitals input, QR scanning, demographic, etc.), auto-dictation
 * is completely removed, and any previous audio is immediately stopped upon screen exit.
 */
export default function useAutoNarration() {
  const { currentScreen, sessionData } = useKioskStore();

  useEffect(() => {
    const isInterviewActive = currentScreen === 6 && sessionData?.intakeMode === 'interview';
    if (!isInterviewActive) {
      audioService.stop();
    }
  }, [currentScreen, sessionData?.intakeMode]);
}

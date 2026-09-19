'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LiveClockProps {
  className?: string;
  showIcon?: boolean;
}

export const LiveClock: React.FC<LiveClockProps> = ({ className = '', showIcon = true }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateClock = () => {
      const now = new Date();
      // Format: 03:45:12 PM
      const formattedTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Format: Fri, 18 Sep 2026
      const formattedDate = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setTimeStr(formattedTime);
      setDateStr(formattedDate);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return (
      <div className={`hidden sm:flex flex-col items-end justify-center px-2.5 py-1 rounded-lg bg-[#003834]/80 border border-[#09726b]/60 min-w-[120px] ${className}`}>
        <div className="h-3.5 w-16 bg-[#002522] animate-pulse rounded" />
        <div className="h-2.5 w-20 bg-[#002522] animate-pulse rounded mt-1" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#003834]/90 border border-[#09726b] shadow-xs select-none ${className}`}
      title="Current Hospital System Date & Time"
    >
      {showIcon && <Clock className="w-3.5 h-3.5 text-teal-300 shrink-0 hidden md:block" />}
      <div className="flex flex-col items-end justify-center leading-none">
        {/* Big Time */}
        <span className="text-xs sm:text-sm font-bold font-mono tracking-wide text-white leading-none">
          {timeStr}
        </span>
        {/* Today's Date & Day */}
        <span className="text-[10px] font-medium text-[#99f6e4]/85 tracking-normal mt-0.5 leading-none">
          {dateStr}
        </span>
      </div>
    </div>
  );
};

export default LiveClock;

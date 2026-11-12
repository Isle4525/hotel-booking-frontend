import React, { useEffect, useRef } from 'react';
import useNow from '../utils/useNow.js';

export default function Countdown({ endsAt, onExpire }) {
  const now = useNow();
  const expiredCallback = useRef(false);
  const endTime = new Date(endsAt).getTime();
  const remaining = Number.isFinite(endTime) ? Math.max(0, endTime - now) : 0;

  useEffect(() => {
    if (remaining === 0 && !expiredCallback.current) {
      expiredCallback.current = true;
      onExpire?.();
    }
  }, [onExpire, remaining]);

  if (remaining === 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');

  return (
    <span className="discount-countdown" aria-label="Время до окончания скидки">
      {days > 0 ? `${days}д ` : ''}{pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

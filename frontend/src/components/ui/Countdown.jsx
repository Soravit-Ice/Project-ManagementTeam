import { useEffect, useState } from 'react';

export default function Countdown({ seconds, onCompleted }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onCompleted?.();
      return undefined;
    }
    const id = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [remaining, onCompleted]);

  return <span>{remaining}s</span>;
}

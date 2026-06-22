import { useState, useEffect, useRef } from 'react';
import { ProgressBar } from 'react-bootstrap';

function Timer({ seconds = 90, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const pct = Math.round((remaining / seconds) * 100);
  const variant = remaining <= 10 ? 'danger' : remaining <= 30 ? 'warning' : 'success';

  return (
    <div>
      <div className="d-flex justify-content-between mb-1">
        <strong>Time left</strong>
        <span className={remaining <= 10 ? 'text-danger fw-bold' : ''}>{remaining}s</span>
      </div>
      <ProgressBar now={pct} variant={variant} animated={remaining > 0} />
    </div>
  );
}

export default Timer;
import { useState, useEffect } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="text-center space-y-2 fade-in">
      <div className="text-4xl md:text-6xl font-orbitron font-bold text-glow">
        {formatTime(time)}
      </div>
      <div className="text-sm md:text-base text-muted-foreground">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default DigitalClock;

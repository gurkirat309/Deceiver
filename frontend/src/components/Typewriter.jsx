import { useState, useEffect } from 'react';

export default function Typewriter({ text, speed = 40, delay = 0, className = "", showCursor = true }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let intervalId;
    let timeoutId;
    let index = 0;
    let currentText = '';

    const startTyping = () => {
      intervalId = setInterval(() => {
        if (index < text.length) {
          currentText += text.charAt(index);
          setDisplayedText(currentText);
          index++;
        } else {
          clearInterval(intervalId);
          setIsTypingComplete(true);
        }
      }, speed);
    };

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        startTyping();
      }, delay);
    } else {
      startTyping();
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isTypingComplete && (
        <span className="inline-block w-1.5 h-4 bg-secondary ml-1 animate-[typing-cursor_0.8s_step-end_infinite]" />
      )}
    </span>
  );
}


import React, { useEffect, useRef } from 'react';

interface AutoResizingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  style: React.CSSProperties;
  className?: string;
  autoFocus?: boolean;
}

const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({
  value,
  onChange,
  onBlur,
  style,
  className,
  autoFocus
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, style.fontSize, style.width, style.lineHeight]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{
        ...style,
        resize: 'none',
        overflow: 'hidden',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        padding: 0,
        margin: 0,
      }}
      className={className}
    />
  );
};

export default AutoResizingTextarea;

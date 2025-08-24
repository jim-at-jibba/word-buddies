'use client';

import { useState, useRef, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

interface SpellingInputProps {
  onSubmit: (spelling: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export interface SpellingInputRef {
  focusInput: () => void;
}

const SpellingInput = memo(forwardRef<SpellingInputRef, SpellingInputProps>(function SpellingInput({
  onSubmit,
  disabled = false,
  placeholder = "Type the word here...",
  maxLength = 20,
  className = ''
}: SpellingInputProps, ref) {
  const [value, setValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focusInput method to parent components
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    }
  }), [disabled]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim()) {
      // Shake animation for empty input
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`cat-input ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            autoComplete="off"
            spellCheck="false"
            aria-label="Type the spelling of the word you heard"
            aria-describedby="spelling-instructions"
          />
        </motion.div>

        <motion.button
          type="submit"
          disabled={disabled || !value.trim()}
          className={`cat-button w-full text-xl py-4 ${
            disabled || !value.trim() 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:shadow-cat-hover'
          }`}
          whileHover={!disabled && value.trim() ? { scale: 1.02 } : {}}
          whileTap={!disabled && value.trim() ? { scale: 0.98 } : {}}
        >
          {disabled ? (
            <span className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Checking...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Check Spelling</span>
            </span>
          )}
        </motion.button>
      </form>

      {/* Typing encouragement */}
      {value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          <p className="text-cat-gray font-kid-friendly text-sm">
            {value.length} letter{value.length !== 1 ? 's' : ''} typed
          </p>
        </motion.div>
      )}

      {/* Character limit indicator */}
      {value.length > maxLength * 0.8 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-right"
        >
          <p className={`text-xs font-kid-friendly ${
            value.length >= maxLength ? 'text-cat-error' : 'text-cat-warning'
          }`}>
            {maxLength - value.length} characters left
          </p>
        </motion.div>
      )}
    </div>
  );
}));

export default SpellingInput;
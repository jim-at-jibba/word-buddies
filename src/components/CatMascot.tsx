'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

interface CatMascotProps {
  mood?: 'happy' | 'excited' | 'encouraging' | 'thinking';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}

const CatMascot = memo(function CatMascot({ 
  mood = 'happy', 
  size = 'medium', 
  onClick,
  className = '' 
}: CatMascotProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const animations = {
    happy: {
      y: [0, -8, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    excited: {
      y: [0, -12, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    encouraging: {
      x: [0, 4, -4, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    thinking: {
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  // Cat SVG based on mood
  const renderCat = () => {
    const baseColor = "#FF8C42";
    
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size]} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Cat mascot in ${mood} mood`}
      >
        {/* Cat ears */}
        <path
          d="M25 35 L35 15 L45 35 Z"
          fill={baseColor}
          stroke="#2C2C2E"
          strokeWidth="2"
        />
        <path
          d="M55 35 L65 15 L75 35 Z"
          fill={baseColor}
          stroke="#2C2C2E"
          strokeWidth="2"
        />
        
        {/* Inner ears */}
        <path
          d="M30 30 L35 20 L40 30 Z"
          fill="#FFB366"
        />
        <path
          d="M60 30 L65 20 L70 30 Z"
          fill="#FFB366"
        />
        
        {/* Cat head */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill={baseColor}
          stroke="#2C2C2E"
          strokeWidth="2"
        />
        
        {/* Cat eyes */}
        {mood === 'happy' && (
          <>
            <path d="M40 45 Q45 40 50 45" stroke="#2C2C2E" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 45 Q55 40 60 45" stroke="#2C2C2E" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        
        {mood === 'excited' && (
          <>
            <circle cx="42" cy="45" r="4" fill="#2C2C2E" />
            <circle cx="58" cy="45" r="4" fill="#2C2C2E" />
            <circle cx="43" cy="44" r="1" fill="white" />
            <circle cx="59" cy="44" r="1" fill="white" />
          </>
        )}
        
        {(mood === 'encouraging' || mood === 'thinking') && (
          <>
            <ellipse cx="42" cy="45" rx="3" ry="4" fill="#2C2C2E" />
            <ellipse cx="58" cy="45" rx="3" ry="4" fill="#2C2C2E" />
            <circle cx="43" cy="44" r="1" fill="white" />
            <circle cx="59" cy="44" r="1" fill="white" />
          </>
        )}
        
        {/* Cat nose */}
        <path
          d="M48 52 L50 55 L52 52 Z"
          fill="#E63946"
        />
        
        {/* Cat mouth */}
        {mood === 'happy' && (
          <path
            d="M50 58 Q45 62 40 58 M50 58 Q55 62 60 58"
            stroke="#2C2C2E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        
        {mood === 'excited' && (
          <ellipse
            cx="50"
            cy="60"
            rx="6"
            ry="3"
            fill="#2C2C2E"
          />
        )}
        
        {(mood === 'encouraging' || mood === 'thinking') && (
          <path
            d="M50 58 Q47 60 44 58 M50 58 Q53 60 56 58"
            stroke="#2C2C2E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        
        {/* Whiskers */}
        <path d="M25 48 L35 46" stroke="#2C2C2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M25 52 L35 50" stroke="#2C2C2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M65 46 L75 48" stroke="#2C2C2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M65 50 L75 52" stroke="#2C2C2E" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Thinking bubble for thinking mode */}
        {mood === 'thinking' && (
          <g>
            <circle cx="75" cy="25" r="8" fill="white" stroke="#2C2C2E" strokeWidth="1.5" />
            <circle cx="70" cy="32" r="3" fill="white" stroke="#2C2C2E" strokeWidth="1.5" />
            <circle cx="68" cy="36" r="2" fill="white" stroke="#2C2C2E" strokeWidth="1.5" />
            <text x="75" y="30" textAnchor="middle" fontSize="10" fill="#FF8C42">?</text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <motion.div
      animate={animations[mood]}
      className={`cat-mascot cursor-pointer select-none ${onClick ? 'hover:scale-110' : ''} transition-transform`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {renderCat()}
    </motion.div>
  );
});

export default CatMascot;
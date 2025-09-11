'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import Image from 'next/image';

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
    small: 'w-20 h-20',      // 80px (was 64)
    medium: 'w-32 h-32',     // 128px (was 96)
    large: 'w-40 h-40',      // 160px (was 128)
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

  // Replaced SVG mascot with static image while preserving motion animations.
  const renderCat = () => {
    return (
      <div className={`${sizeClasses[size]} ${className} relative`} aria-label={`Cat mascot in ${mood} mood`} role="img">
        <Image
          src="/wednesday.png"
          alt={`Cat mascot showing ${mood} mood`}
          draggable={false}
          fill
          priority={size === 'large'}
          className="object-cover rounded-full shadow-md select-none"
          sizes="(max-width: 640px) 128px, 160px"
        />
        {mood === 'thinking' && (
          <div className="absolute -top-2 -right-2 flex flex-col items-center">
            <div className="bg-white text-[#FF8C42] border border-[#2C2C2E] rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-sm">?</div>
            <div className="w-3 h-3 bg-white border border-[#2C2C2E] rounded-full mt-1" />
            <div className="w-2 h-2 bg-white border border-[#2C2C2E] rounded-full mt-0.5" />
          </div>
        )}
      </div>
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
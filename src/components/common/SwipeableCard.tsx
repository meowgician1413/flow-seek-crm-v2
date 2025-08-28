import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  className?: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  className,
  disabled = false
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = translateX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const deltaX = e.touches[0].clientX - startX.current;
    const newTranslateX = currentX.current + deltaX;
    
    // Limit swipe distance
    const maxSwipe = 120;
    const clampedTranslateX = Math.max(-maxSwipe, Math.min(maxSwipe, newTranslateX));
    
    setTranslateX(clampedTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    const threshold = 60;
    
    if (translateX > threshold && rightAction) {
      // Swipe right action
      rightAction.action();
      setTranslateX(0);
    } else if (translateX < -threshold && leftAction) {
      // Swipe left action
      leftAction.action();
      setTranslateX(0);
    } else {
      // Reset position
      setTranslateX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left action background */}
      {leftAction && (
        <div className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-center w-24 transition-opacity",
          leftAction.className || "bg-destructive text-destructive-foreground",
          translateX < 0 ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-1">
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right action background */}
      {rightAction && (
        <div className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-center w-24 transition-opacity",
          rightAction.className || "bg-green-500 text-white",
          translateX > 0 ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-1">
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main card content */}
      <div
        className={cn(
          "transition-transform bg-card relative z-10",
          isDragging ? "duration-0" : "duration-200",
          className
        )}
        style={{
          transform: `translateX(${translateX}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
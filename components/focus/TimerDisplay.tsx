'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  mode: 'focus' | 'break' | 'idle';
  isRunning: boolean;
  duration: number;
  remaining: number;
  totalDuration: number;
  onAdjustMinutes?: (delta: number) => void;
  onAdjustSeconds?: (delta: number) => void;
}

export function TimerDisplay({ minutes, seconds, mode, isRunning, duration, remaining, totalDuration, onAdjustMinutes, onAdjustSeconds }: TimerDisplayProps) {
  const modeColors = {
    focus: 'from-blue-500 to-indigo-600',
    break: 'from-green-500 to-emerald-600',
    idle: 'from-gray-400 to-gray-500',
  };

  const modeText = {
    focus: 'Focus Time',
    break: 'Break Time',
    idle: 'Ready to Start',
  };

  // Calculate progress (0 to 1, where 0 is full and 1 is empty)
  const progress = totalDuration > 0 ? 1 - (remaining / totalDuration) : 0;
  
  // Calculate sand levels with proper clamping
  const topSandHeight = Math.max(2, Math.min(35, 35 * (1 - progress))); // Start at 35, decrease to 2
  const bottomSandHeight = Math.max(2, Math.min(35, 35 * progress)); // Start at 2, increase to 35
  
  // Calculate dynamic Y positions for top sand
  const topSandY = 20 + (35 - topSandHeight);
  
  // Calculate dynamic Y positions for bottom sand (aligned with chamber base at y=128)
  const bottomBaseY = 128; // Bottom chamber base
  const bottomTopY = bottomBaseY - bottomSandHeight; // y position = base - height

  return (
    <div className="flex flex-col items-center">
      <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${modeColors[mode]} text-transparent bg-clip-text`}>
        {modeText[mode]}
      </h3>
      
      <div className="relative">
        {/* Sandglass Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-32">
            {/* Hourglass Frame */}
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* Glass Frame */}
              <defs>
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={mode === 'focus' ? 'stop-blue-400/20' : 'stop-green-400/20'} />
                  <stop offset="100%" className={mode === 'focus' ? 'stop-indigo-400/20' : 'stop-emerald-400/20'} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Clip path for top chamber */}
                <clipPath id="topChamberClip">
                  <path d="M 32 12 L 68 12 L 68 35 Q 68 39 64 43 L 54 53 Q 50 57 50 62 Q 50 57 46 53 L 36 43 Q 32 39 32 35 Z" />
                </clipPath>
                
                {/* Clip path for bottom chamber */}
                <clipPath id="bottomChamberClip">
                  <path d="M 32 128 L 68 128 L 68 105 Q 68 101 64 97 L 54 87 Q 50 83 50 78 Q 50 83 46 87 L 36 97 Q 32 101 32 105 Z" />
                </clipPath>
              </defs>
              
              {/* Outer glass */}
              <path 
                d="M 30 10 L 70 10 L 70 35 Q 70 40 65 45 L 55 55 Q 50 60 50 65 Q 50 60 45 55 L 35 45 Q 30 40 30 35 Z" 
                fill="none" 
                stroke={mode === 'focus' ? '#3b82f6' : '#10b981'} 
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />
              <path 
                d="M 30 130 L 70 130 L 70 105 Q 70 100 65 95 L 55 85 Q 50 80 50 75 Q 50 80 45 85 L 35 95 Q 30 100 30 105 Z" 
                fill="none" 
                stroke={mode === 'focus' ? '#3b82f6' : '#10b981'} 
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />
              
              {/* Top rim */}
              <rect x="25" y="8" width="50" height="4" rx="2" fill={mode === 'focus' ? '#3b82f6' : '#10b981'} />
              {/* Bottom rim */}
              <rect x="25" y="128" width="50" height="4" rx="2" fill={mode === 'focus' ? '#3b82f6' : '#10b981'} />
              
              {/* Neck connector */}
              <ellipse cx="50" cy="70" rx="8" ry="3" fill={mode === 'focus' ? '#3b82f6' : '#10b981'} opacity="0.3" />
              
              {/* Sand in top (decreasing when running) - with clipping */}
              {topSandHeight > 2 && (
                <g clipPath="url(#topChamberClip)">
                  <rect
                    x="32"
                    y={topSandY}
                    width="36"
                    height={topSandHeight}
                    fill={mode === 'focus' ? '#60a5fa' : '#34d399'}
                    opacity="0.8"
                    className="transition-all duration-1000"
                  />
                </g>
              )}
              
              {/* Sand falling animation */}
              {isRunning && (
                <circle cx="50" cy="70" r="1.5" fill={mode === 'focus' ? '#60a5fa' : '#34d399'}>
                  <animate
                    attributeName="cy"
                    values="60;75"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Sand in bottom (increasing when running) - with clipping */}
              {bottomSandHeight > 2 && (
                <g clipPath="url(#bottomChamberClip)">
                  <rect
                    x="32"
                    y={bottomTopY}
                    width="36"
                    height={bottomSandHeight}
                    fill={mode === 'focus' ? '#60a5fa' : '#34d399'}
                    opacity="0.9"
                    className="transition-all duration-1000"
                  />
                </g>
              )}
              
              {/* Sparkle effects */}
              {isRunning && (
                <>
                  <circle cx="40" cy="25" r="1.5" fill="white" opacity="0.8">
                    <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="60" cy="115" r="1.5" fill="white" opacity="0.8">
                    <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                  </circle>
                </>
              )}
            </svg>
            
            {/* Glow effect when running */}
            {isRunning && (
              <div 
                className={`absolute inset-0 ${mode === 'focus' ? 'bg-blue-400' : 'bg-green-400'} opacity-20 blur-xl rounded-full animate-pulse`}
              />
            )}
          </div>
        </div>

        {/* iOS-style Timer Picker */}
        <div className="flex items-center justify-center gap-2">
          {/* Minutes Picker */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => !isRunning && onAdjustMinutes?.(1)}
              disabled={isRunning}
              className={`p-2 rounded-lg transition-all ${
                !isRunning 
                  ? 'hover:bg-gray-100 active:scale-95 cursor-pointer text-gray-600 hover:text-gray-900' 
                  : 'opacity-30 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Increase minutes"
            >
              <ChevronUp size={24} />
            </button>
            
            <div className={`relative overflow-hidden h-32 w-28 flex items-center justify-center rounded-2xl ${
              !isRunning ? 'bg-gray-50' : 'bg-transparent'
            }`}>
              <div className={`text-7xl font-bold bg-gradient-to-r ${modeColors[mode]} text-transparent bg-clip-text tabular-nums transition-all duration-300 ease-out ${
                isRunning ? 'animate-pulse' : 'hover:scale-105'
              }`}>
                {String(minutes).padStart(2, '0')}
              </div>
              {!isRunning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => !isRunning && onAdjustMinutes?.(-1)}
              disabled={isRunning || minutes <= 0}
              className={`p-2 rounded-lg transition-all ${
                !isRunning && minutes > 0
                  ? 'hover:bg-gray-100 active:scale-95 cursor-pointer text-gray-600 hover:text-gray-900' 
                  : 'opacity-30 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Decrease minutes"
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Colon Separator */}
          <div className={`text-6xl font-bold bg-gradient-to-r ${modeColors[mode]} text-transparent bg-clip-text mb-2`}>
            :
          </div>

          {/* Seconds Picker */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => !isRunning && onAdjustSeconds?.(1)}
              disabled={isRunning}
              className={`p-2 rounded-lg transition-all ${
                !isRunning 
                  ? 'hover:bg-gray-100 active:scale-95 cursor-pointer text-gray-600 hover:text-gray-900' 
                  : 'opacity-30 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Increase seconds"
            >
              <ChevronUp size={24} />
            </button>
            
            <div className={`relative overflow-hidden h-32 w-28 flex items-center justify-center rounded-2xl ${
              !isRunning ? 'bg-gray-50' : 'bg-transparent'
            }`}>
              <div className={`text-7xl font-bold bg-gradient-to-r ${modeColors[mode]} text-transparent bg-clip-text tabular-nums transition-all duration-300 ease-out ${
                isRunning ? 'animate-pulse' : 'hover:scale-105'
              }`}>
                {String(seconds).padStart(2, '0')}
              </div>
              {!isRunning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => !isRunning && onAdjustSeconds?.(-1)}
              disabled={isRunning || seconds <= 0}
              className={`p-2 rounded-lg transition-all ${
                !isRunning && seconds > 0
                  ? 'hover:bg-gray-100 active:scale-95 cursor-pointer text-gray-600 hover:text-gray-900' 
                  : 'opacity-30 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Decrease seconds"
            >
              <ChevronDown size={24} />
            </button>
          </div>
        </div>
        
        {/* Duration Display */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${mode === 'focus' ? 'bg-blue-50 text-blue-700' : mode === 'break' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'} transition-all duration-300`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{duration} {duration === 1 ? 'minute' : 'minutes'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

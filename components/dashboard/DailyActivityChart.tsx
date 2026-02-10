'use client';

import { useEffect, useState } from 'react';

interface DailyActivityChartProps {
  data: { day: string; completed: number; total: number; percentage: number }[];
}

export function DailyActivityChart({ data }: DailyActivityChartProps) {
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      console.error('DailyActivityChart: Invalid data prop provided', data);
      return;
    }
    const max = Math.max(...data.map(d => d.total || 0), 1);
    setMaxValue(max);
  }, [data]);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-24 sm:h-32 flex items-center justify-center text-gray-400 text-xs">
        No activity data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-24 sm:h-32 gap-1 px-1">
        {data.map((day, idx) => {
          const height = maxValue > 0 ? ((day.completed || 0) / maxValue) * 100 : 0;
          return (
            <div key={`${day.day}-${idx}`} className="flex flex-col items-center flex-1 group">
              {/* Bar Container */}
              <div className="w-full flex items-end justify-center h-full mb-2 bg-gray-50 rounded-full overflow-hidden">
                <div
                  className="w-full sm:w-3/4 bg-[#4CAF50] rounded-full transition-all duration-700 ease-out"
                  style={{
                    height: `${height}%`,
                    minHeight: day.completed > 0 ? '8px' : '0px'
                  }}
                />
              </div>

              {/* Day label */}
              <div className="text-[10px] sm:text-xs font-medium text-gray-400">
                {day.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

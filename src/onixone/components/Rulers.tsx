
import React from 'react';

interface RulersProps {
  width: number;
  height: number;
  scale: number;
  onDragStart: (type: 'horizontal' | 'vertical', e: React.MouseEvent) => void;
}

const Rulers: React.FC<RulersProps> = ({ width, height, scale, onDragStart }) => {
  const tickSpacing = 50; // Every 50 PDF units
  const majorTick = 100; // Major tick every 100

  const xTicks = [];
  const yTicks = [];

  for (let x = 0; x <= width; x += tickSpacing) {
    xTicks.push(x);
  }
  for (let y = 0; y <= height; y += tickSpacing) {
    yTicks.push(y);
  }

  return (
    <>
      {/* Top Ruler */}
      <div 
        className="absolute top-0 left-0 bg-gray-50 border-b border-gray-300 z-50 opacity-100 cursor-s-resize hover:bg-gray-100 transition-colors"
        style={{ width: width * scale, height: '20px', left: 0, top: '-20px' }}
        onMouseDown={(e) => onDragStart('horizontal', e)}
      >
        {xTicks.map(val => (
          <div key={`x-${val}`} className="absolute bottom-0 border-l border-gray-400 text-[9px] text-gray-500 pl-0.5 pointer-events-none"
            style={{ left: val * scale, height: val % majorTick === 0 ? '100%' : '50%' }}
          >
            {val % majorTick === 0 && <span className="absolute -top-1 left-0.5">{val}</span>}
          </div>
        ))}
      </div>

      {/* Left Ruler */}
      <div 
        className="absolute top-0 left-0 bg-gray-50 border-r border-gray-300 z-50 opacity-100 cursor-e-resize hover:bg-gray-100 transition-colors"
        style={{ height: height * scale, width: '20px', left: '-20px', top: 0 }}
        onMouseDown={(e) => onDragStart('vertical', e)}
      >
        {yTicks.map(val => (
          <div key={`y-${val}`} className="absolute right-0 border-t border-gray-400 text-[9px] text-gray-500 pt-0.5 pointer-events-none"
            style={{ top: val * scale, width: val % majorTick === 0 ? '100%' : '50%' }}
          >
            {val % majorTick === 0 && <span className="absolute -left-1 top-0.5 transform -rotate-90 origin-top-right">{val}</span>}
          </div>
        ))}
      </div>
      
      {/* Corner Box */}
      <div className="absolute top-[-20px] left-[-20px] w-[20px] h-[20px] bg-gray-200 border-r border-b border-gray-300 z-50 text-[9px] flex items-center justify-center text-gray-500">
          px
      </div>
    </>
  );
};

export default Rulers;